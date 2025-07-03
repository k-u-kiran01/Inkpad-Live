import mongoose from "mongoose";
import Document from "../../db/models/Document";

export interface editmd {
  docId: string;
  editedby: { _id: mongoose.Types.ObjectId; name: string };
  content: string;
}

interface PendingUpdate {
  docId: string;
  content: string;
  editedby: { _id: mongoose.Types.ObjectId; name: string };
  lastUpdateTime: number;
  pendingCallbacks: Array<(result: { status: string; error?: string }) => void>;
}

// Global state for managing pending updates
const pendingUpdates = new Map<string, PendingUpdate>();
const updateTimers = new Map<string, NodeJS.Timeout>();

// Update interval: 1 second
const UPDATE_INTERVAL = 1000;

const processPendingUpdate = async (docId: string) => {
  const pending = pendingUpdates.get(docId);
  if (!pending) return;

  try {
    // console.log(`Processing batched update for docId: ${docId}`);
    
    const doc = await Document.findOneAndUpdate(
      { docId: docId },
      { 
        $set: { 
          content: pending.content, 
          lastEditedBy: pending.editedby,
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        maxTimeMS: 10000, 
        writeConcern: { w: 'majority' }
      }
    );

    if (!doc) {
      throw new Error("Document not found");
    }

    pending.pendingCallbacks.forEach(callback => {
      callback({ status: "ok" });
    });

    // console.log(`Successfully saved batched update for docId: ${docId}`);
    
  } catch (error) {
    console.error(`Error in batched update for docId: ${docId}:`, error);
    
    pending.pendingCallbacks.forEach(callback => {
      callback({ 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    });
  } finally {
    pendingUpdates.delete(docId);
    updateTimers.delete(docId);
  }
};

const scheduleUpdate = (docId: string) => {
  const existingTimer = updateTimers.get(docId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    processPendingUpdate(docId);
  }, UPDATE_INTERVAL);

  updateTimers.set(docId, timer);
};

const updatemd = async ({ docId, editedby, content }: editmd): Promise<string> => {
  return new Promise((resolve, reject) => {
    const callback = (result: { status: string; error?: string }) => {
      if (result.status === "ok") {
        resolve(content); 
      } else {
        reject(new Error(result.error || "Update failed"));
      }
    };

    let pending = pendingUpdates.get(docId);
    
    if (pending) {
      pending.content = content;
      pending.editedby = editedby;
      pending.lastUpdateTime = Date.now();
      pending.pendingCallbacks.push(callback);
    } else {
      pending = {
        docId,
        content,
        editedby,
        lastUpdateTime: Date.now(),
        pendingCallbacks: [callback]
      };
      pendingUpdates.set(docId, pending);
    }

    scheduleUpdate(docId);
  });
};


export default updatemd;