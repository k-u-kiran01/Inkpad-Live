import mongoose from "mongoose";
import Document from "../../db/models/Document";
import { CustomError } from "../middlewares/error";

export interface editmd {
  docId: string;
  editedby: { _id: mongoose.Types.ObjectId; name: string };
  content: string;
}

const updatemd = async ({ docId, editedby, content }: editmd) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const doc = await Document.findOneAndUpdate(
      { docId: docId },
      { $set: { content: content, lastEditedBy: editedby } },
      { new: true, session}
    );

    if (!doc) {
      session.abortTransaction();
      session.endSession();
      const error: CustomError = new Error("Doc not found");
      error.statusCode = 404;
      throw error;
    }
    await session.commitTransaction();
    session.endSession();
    return doc.content;
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw error;
  }
};
export default updatemd;
