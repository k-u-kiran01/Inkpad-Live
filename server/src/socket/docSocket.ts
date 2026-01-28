/**
 * Document Socket Handler
 * 
 * Manages real-time collaborative editing via WebSocket connections.
 * Key features:
 * - Operational Transformation (OT) for conflict resolution
 * - Viewer tracking by socket.id for reliable cleanup
 * - Document state caching in memory with DB persistence
 */
import { Server, Socket } from "socket.io";
import updatemd from "./updatemd";
import mongoose from "mongoose";
import { CustomError } from "../middlewares/error";
import Document from "../../db/models/Document";
import { Operation, DocState } from "../../types/operations";
import {
  receiveOperation,
  ResyncRequired,
  updateClientAck,
  pruneOps
} from "../utils/transformations";

interface CurrUserDetails {
  userId: mongoose.Types.ObjectId;
  name: string;
  docId: string;
}

/** In-memory document state cache */
const docData: Map<string, DocState> = new Map();

/** Viewers list per document - keyed by socketId for reliable cleanup */
const viewersByDocId: Record<string, { socketId: string; userId: string; name: string }[]> = {};

/**
 * Load document state from DB or create new state if not cached
 */
async function getOrCreateDocState(docId: string): Promise<DocState> {
  if (!docData.has(docId)) {
    const dbDoc = await Document.findOne({ docId }).lean();
    const state: DocState = {
      content: dbDoc?.content || "",
      version: 0,
      ops: [],
      clients: {}
    };
    docData.set(docId, state);
  }
  return docData.get(docId)!;
}

/**
 * Register all document-related socket event handlers
 */
export const registerDocumentSocket = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    // Track current user for this socket connection
    let currUser: CurrUserDetails = {
      userId: new mongoose.Types.ObjectId(),
      name: "",
      docId: "",
    };

    // === JOIN DOCUMENT ===
    socket.on("join-doc", async ({ userId, name, docId }: { userId?: string; name: string; docId: string }) => {
      currUser = {
        userId: mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : new mongoose.Types.ObjectId(),
        name,
        docId,
      };

      socket.join(docId);
      const docState = await getOrCreateDocState(docId);

      // Track client's acknowledged version for OT
      docState.clients[socket.id] = docState.version;

      // Send initial document state
      socket.emit("doc-init", { content: docState.content, version: docState.version });

      // Add to viewers list (using socket.id as key for reliable cleanup)
      if (!viewersByDocId[docId]) viewersByDocId[docId] = [];
      const alreadyIn = viewersByDocId[docId].some((v) => v.socketId === socket.id);
      if (!alreadyIn) {
        viewersByDocId[docId].push({ socketId: socket.id, userId: currUser.userId.toString(), name });
      }
      
      // Broadcast updated viewers (strip internal socketId)
      const viewersForClient = viewersByDocId[docId].map(v => ({ userId: v.userId, name: v.name }));
      io.to(docId).emit("update-viewers", viewersForClient);
    });

    // === REQUEST MISSED OPERATIONS (for reconnection) ===
    socket.on("request-missed-ops", async ({ docId, fromVersion }: { docId: string; fromVersion: number }, cb?: (payload: any) => void) => {
      try {
        const docState = await getOrCreateDocState(docId);
        const earliest = docState.ops.length > 0 ? docState.ops[0].version : docState.version;
        
        if (fromVersion < earliest) {
          // History not available - send full document
          cb?.({ full: true, content: docState.content, version: docState.version });
          return;
        }
        
        const ops = docState.ops.filter(o => o.version > fromVersion);
        cb?.({ full: false, ops, version: docState.version });
      } catch (err) {
        console.error("request-missed-ops error", err);
        cb?.({ error: "failed" });
      }
    });

    // === HANDLE DOCUMENT EDIT ===
    socket.on("markdown-change", async ({ docId, op }: { docId: string; op: Operation }, ack?: (res: any) => void) => {
      try {
        const dbDoc = await Document.findOne({ docId });
        if (!dbDoc) {
          const error: CustomError = new Error("Document not found");
          error.statusCode = 404;
          throw error;
        }
        
        const docState = await getOrCreateDocState(docId);

        // Authorization: must be collaborator and not guest
        const isCollaborator = dbDoc.collaborators?.some((c) => c._id?.toString() === currUser.userId.toString());
        if (currUser.name === "guest" || !isCollaborator) {
          const error: CustomError = new Error("Not authorized to edit");
          error.statusCode = 401;
          throw error;
        }

        // Apply operation with OT transformation
        let appliedOp: Operation;
        try {
          appliedOp = receiveOperation(op, docState);
        } catch (err) {
          if (err instanceof ResyncRequired) {
            socket.emit("resync", { content: err.content, version: err.version });
            ack?.({ status: "resync", version: err.version });
            return;
          }
          throw err;
        }

        // Update client's acknowledged version
        docState.clients[socket.id] = docState.version;

        // Broadcast to other clients
        socket.to(docId).emit("receive-markdown", { op: appliedOp }.op);
        
        // Persist to database
        await updatemd({
          docId,
          content: docState.content,
          editedby: { _id: currUser.userId, name: currUser.name },
        });

        ack?.({ status: "ok", version: docState.version });
      } catch (err: any) {
        console.error("Markdown change error:", err);
        ack?.({ status: "error", message: err.message || "Failed to process document change" });
      }
    });

    // === CLIENT ACKNOWLEDGES RECEIVED OPS ===
    socket.on("ack", async ({ docId, version }: { docId: string; version: number }) => {
      try {
        const docState = docData.get(docId);
        if (!docState) return;
        updateClientAck(docState, socket.id, version);
      } catch (err) {
        console.error("ack error", err);
      }
    });

    // === LEAVE DOCUMENT ===
    socket.on("leave-doc", ({ docId }: { userId: string; docId: string }) => {
      viewersByDocId[docId] = viewersByDocId[docId]?.filter((v) => v.socketId !== socket.id) || [];
      
      const viewersForClient = viewersByDocId[docId].map(v => ({ userId: v.userId, name: v.name }));
      socket.to(docId).emit("update-viewers", viewersForClient);
      socket.leave(docId);

      const docState = docData.get(docId);
      if (docState) {
        delete docState.clients[socket.id];
        pruneOps(docState);
      }
    });

    // === HANDLE DISCONNECT ===
    socket.on("disconnect", () => {
      if (currUser.docId) {
        viewersByDocId[currUser.docId] = viewersByDocId[currUser.docId]?.filter(
          (v) => v.socketId !== socket.id
        ) || [];

        const viewersForClient = viewersByDocId[currUser.docId].map(v => ({ userId: v.userId, name: v.name }));
        io.to(currUser.docId).emit("update-viewers", viewersForClient);

        const docState = docData.get(currUser.docId);
        if (docState) {
          delete docState.clients[socket.id];
          pruneOps(docState);
        }
      }
    });

    // === COLLABORATOR MANAGEMENT ===
    socket.on("add-collaborator", async ({ docId }) => {
      try {
        const doc = await Document.findOne({ docId });
        if (!doc) throw new Error("Document not found");
        
        const collaborators = doc.collaborators.map((c) => ({
          id: c._id?.toString(),
          name: c.name,
        }));
        io.to(docId).emit("update-collaborators", collaborators);
      } catch (error) {
        console.error("Add collaborator error:", error);
      }
    });

    socket.on("remove-collaborator", async ({ docId }) => {
      try {
        const doc = await Document.findOne({ docId });
        if (!doc) throw new Error("Document not found");
        
        const collaborators = doc.collaborators.map((c) => ({
          _id: c._id?.toString(),
          name: c.name,
        }));
        io.to(docId).emit("update-collaborators", collaborators);
      } catch (error) {
        console.error("Remove collaborator error:", error);
      }
    });
  });
};
