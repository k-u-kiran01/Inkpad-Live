"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDocumentSocket = void 0;
const updatemd_1 = __importDefault(require("./updatemd"));
const mongoose_1 = __importDefault(require("mongoose"));
const Document_1 = __importDefault(require("../../db/models/Document"));
const transformations_1 = require("../utils/transformations");
/** In-memory document state cache */
const docData = new Map();
/** Viewers list per document - keyed by socketId for reliable cleanup */
const viewersByDocId = {};
/**
 * Load document state from DB or create new state if not cached
 */
async function getOrCreateDocState(docId) {
    if (!docData.has(docId)) {
        const dbDoc = await Document_1.default.findOne({ docId }).lean();
        const state = {
            content: dbDoc?.content || "",
            version: 0,
            ops: [],
            clients: {}
        };
        docData.set(docId, state);
    }
    return docData.get(docId);
}
/**
 * Register all document-related socket event handlers
 */
const registerDocumentSocket = (io) => {
    io.on("connection", (socket) => {
        // Track current user for this socket connection
        let currUser = {
            userId: new mongoose_1.default.Types.ObjectId(),
            name: "",
            docId: "",
        };
        // === JOIN DOCUMENT ===
        socket.on("join-doc", async ({ userId, name, docId }) => {
            currUser = {
                userId: mongoose_1.default.isValidObjectId(userId) ? new mongoose_1.default.Types.ObjectId(userId) : new mongoose_1.default.Types.ObjectId(),
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
            if (!viewersByDocId[docId])
                viewersByDocId[docId] = [];
            const alreadyIn = viewersByDocId[docId].some((v) => v.socketId === socket.id);
            if (!alreadyIn) {
                viewersByDocId[docId].push({ socketId: socket.id, userId: currUser.userId.toString(), name });
            }
            // Broadcast updated viewers (strip internal socketId)
            const viewersForClient = viewersByDocId[docId].map(v => ({ userId: v.userId, name: v.name }));
            io.to(docId).emit("update-viewers", viewersForClient);
        });
        // === REQUEST MISSED OPERATIONS (for reconnection) ===
        socket.on("request-missed-ops", async ({ docId, fromVersion }, cb) => {
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
            }
            catch (err) {
                console.error("request-missed-ops error", err);
                cb?.({ error: "failed" });
            }
        });
        // === HANDLE DOCUMENT EDIT ===
        socket.on("markdown-change", async ({ docId, op }, ack) => {
            try {
                const dbDoc = await Document_1.default.findOne({ docId });
                if (!dbDoc) {
                    const error = new Error("Document not found");
                    error.statusCode = 404;
                    throw error;
                }
                const docState = await getOrCreateDocState(docId);
                // Authorization: must be collaborator and not guest
                const isCollaborator = dbDoc.collaborators?.some((c) => c._id?.toString() === currUser.userId.toString());
                if (currUser.name === "guest" || !isCollaborator) {
                    const error = new Error("Not authorized to edit");
                    error.statusCode = 401;
                    throw error;
                }
                // Apply operation with OT transformation
                let appliedOp;
                try {
                    appliedOp = (0, transformations_1.receiveOperation)(op, docState);
                }
                catch (err) {
                    if (err instanceof transformations_1.ResyncRequired) {
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
                await (0, updatemd_1.default)({
                    docId,
                    content: docState.content,
                    editedby: { _id: currUser.userId, name: currUser.name },
                });
                ack?.({ status: "ok", version: docState.version });
            }
            catch (err) {
                console.error("Markdown change error:", err);
                ack?.({ status: "error", message: err.message || "Failed to process document change" });
            }
        });
        // === CLIENT ACKNOWLEDGES RECEIVED OPS ===
        socket.on("ack", async ({ docId, version }) => {
            try {
                const docState = docData.get(docId);
                if (!docState)
                    return;
                (0, transformations_1.updateClientAck)(docState, socket.id, version);
            }
            catch (err) {
                console.error("ack error", err);
            }
        });
        // === LEAVE DOCUMENT ===
        socket.on("leave-doc", ({ docId }) => {
            viewersByDocId[docId] = viewersByDocId[docId]?.filter((v) => v.socketId !== socket.id) || [];
            const viewersForClient = viewersByDocId[docId].map(v => ({ userId: v.userId, name: v.name }));
            socket.to(docId).emit("update-viewers", viewersForClient);
            socket.leave(docId);
            const docState = docData.get(docId);
            if (docState) {
                delete docState.clients[socket.id];
                (0, transformations_1.pruneOps)(docState);
            }
        });
        // === HANDLE DISCONNECT ===
        socket.on("disconnect", () => {
            if (currUser.docId) {
                viewersByDocId[currUser.docId] = viewersByDocId[currUser.docId]?.filter((v) => v.socketId !== socket.id) || [];
                const viewersForClient = viewersByDocId[currUser.docId].map(v => ({ userId: v.userId, name: v.name }));
                io.to(currUser.docId).emit("update-viewers", viewersForClient);
                const docState = docData.get(currUser.docId);
                if (docState) {
                    delete docState.clients[socket.id];
                    (0, transformations_1.pruneOps)(docState);
                }
            }
        });
        // === COLLABORATOR MANAGEMENT ===
        socket.on("add-collaborator", async ({ docId }) => {
            try {
                const doc = await Document_1.default.findOne({ docId });
                if (!doc)
                    throw new Error("Document not found");
                const collaborators = doc.collaborators.map((c) => ({
                    id: c._id?.toString(),
                    name: c.name,
                }));
                io.to(docId).emit("update-collaborators", collaborators);
            }
            catch (error) {
                console.error("Add collaborator error:", error);
            }
        });
        socket.on("remove-collaborator", async ({ docId }) => {
            try {
                const doc = await Document_1.default.findOne({ docId });
                if (!doc)
                    throw new Error("Document not found");
                const collaborators = doc.collaborators.map((c) => ({
                    _id: c._id?.toString(),
                    name: c.name,
                }));
                io.to(docId).emit("update-collaborators", collaborators);
            }
            catch (error) {
                console.error("Remove collaborator error:", error);
            }
        });
    });
};
exports.registerDocumentSocket = registerDocumentSocket;
