import { Server, Socket } from "socket.io";
import updatemd from "./updatemd"; 
import mongoose from "mongoose";
import { CustomError } from "../middlewares/error";
import Document from "../../db/models/Document";

interface currUserdetails {
  userId: mongoose.Types.ObjectId;
  name: string;
  docId: string;
}

const viewersByDocId: Record<string, { userId: string; name: string }[]> = {};

export const registerDocumentSocket = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    let currUser: currUserdetails = {
      userId: new mongoose.Types.ObjectId(),
      name: "",
      docId: "",
    };

    socket.on("join-doc", ({ userId, name, docId }) => {
      currUser = {
        userId: mongoose.isValidObjectId(userId)
          ? new mongoose.Types.ObjectId(userId)
          : new mongoose.Types.ObjectId(), 
        name: name,
        docId: docId,
      };

      socket.join(docId);
      if (!viewersByDocId[docId]) viewersByDocId[docId] = [];
      const alreadyIn = viewersByDocId[docId].some((v) => v.userId === userId);
      if (!alreadyIn) viewersByDocId[docId].push({ userId, name });
      io.to(docId).emit("update-viewers", viewersByDocId[docId]);
    });

    socket.on("leave-doc", ({ userId, docId }) => {
      viewersByDocId[docId] =
        viewersByDocId[docId]?.filter((v) => v.userId !== userId) || [];
      socket.to(docId).emit("update-viewers", viewersByDocId[docId]);
      socket.leave(docId);
    });

    socket.on("markdown-change", async ({ docId, content }, ack) => {
      try {
        const doc = await Document.findOne({ docId });

        if (!doc) {
          const error: CustomError = new Error("Document not found");
          error.statusCode = 404;
          throw error;
        }

        const isCollaborator = doc.collaborators?.some(
          (c) => c._id?.toString() === currUser.userId.toString()
        );

        if (currUser.name === "guest" || !isCollaborator) {
          const error: CustomError = new Error("Not authorized to edit");
          error.statusCode = 401;
          throw error;
        }
        socket.to(docId).emit("receive-markdown", content);
        
        const updated_content = await updatemd({
          docId,
          content,
          editedby: {
            _id: currUser.userId,
            name: currUser.name,
          },
        });

        ack?.({ status: "ok" });        
      } catch (err: any) {
        console.error("Markdown change error:", err);
        ack?.({ 
          status: "error", 
          message: err.message || "Failed to process document change"
        });
      }
    });

    socket.on("disconnect", () => {
      if (currUser.docId) {
        viewersByDocId[currUser.docId] =
          viewersByDocId[currUser.docId]?.filter(
            (v) => v.userId !== currUser.userId.toString()
          ) || [];

        io
          .to(currUser.docId)
          .emit("update-viewers", viewersByDocId[currUser.docId]);
      }
    });

    socket.on('add-collaborator', async ({docId}) => {
      try {
        const doc = await Document.findOne({docId});
        if (!doc) {
          const error: CustomError = new Error("Document not found");
          error.statusCode = 404;
          throw error;
        }
        const updated_collaborators = doc.collaborators.map((c) => ({
          id: c._id?.toString(),
          name: c.name
        }));
        io.to(docId).emit("update-collaborators", updated_collaborators);
      } catch (error) {
        console.error("Add collaborator error:", error);
      }
    });

    socket.on('remove-collaborator', async ({docId}) => {
      try {
        const doc = await Document.findOne({docId});
        if (!doc) {
          const error: CustomError = new Error("Document not found");
          error.statusCode = 404;
          throw error;
        }
        const updated_collaborators = doc.collaborators.map((c) => ({
          _id: c._id?.toString(),
          name: c.name
        }));
        io.to(docId).emit("update-collaborators", updated_collaborators);
      } catch (error) {
        console.error("Remove collaborator error:", error);
      }
    });
  });
};