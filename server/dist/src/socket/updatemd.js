"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Document_1 = __importDefault(require("../../db/models/Document"));
// Global state for managing pending updates
const pendingUpdates = new Map();
const updateTimers = new Map();
// Update interval: 1 second
const UPDATE_INTERVAL = 1000;
const processPendingUpdate = async (docId) => {
    const pending = pendingUpdates.get(docId);
    if (!pending)
        return;
    try {
        // console.log(`Processing batched update for docId: ${docId}`);
        const doc = await Document_1.default.findOneAndUpdate({ docId: docId }, {
            $set: {
                content: pending.content,
                lastEditedBy: pending.editedby,
                updatedAt: new Date()
            }
        }, {
            new: true,
            maxTimeMS: 10000,
            writeConcern: { w: 'majority' }
        });
        if (!doc) {
            throw new Error("Document not found");
        }
        pending.pendingCallbacks.forEach(callback => {
            callback({ status: "ok" });
        });
        // console.log(`Successfully saved batched update for docId: ${docId}`);
    }
    catch (error) {
        console.error(`Error in batched update for docId: ${docId}:`, error);
        pending.pendingCallbacks.forEach(callback => {
            callback({
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        });
    }
    finally {
        pendingUpdates.delete(docId);
        updateTimers.delete(docId);
    }
};
const scheduleUpdate = (docId) => {
    const existingTimer = updateTimers.get(docId);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
        processPendingUpdate(docId);
    }, UPDATE_INTERVAL);
    updateTimers.set(docId, timer);
};
const updatemd = async ({ docId, editedby, content }) => {
    return new Promise((resolve, reject) => {
        const callback = (result) => {
            if (result.status === "ok") {
                resolve(content);
            }
            else {
                reject(new Error(result.error || "Update failed"));
            }
        };
        let pending = pendingUpdates.get(docId);
        if (pending) {
            pending.content = content;
            pending.editedby = editedby;
            pending.lastUpdateTime = Date.now();
            pending.pendingCallbacks.push(callback);
        }
        else {
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
exports.default = updatemd;
