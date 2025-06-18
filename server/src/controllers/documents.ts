import { Request, Response, NextFunction } from "express";
import Document from "../../db/models/Document";
import mongoose from "mongoose";
import { CustomError } from "../middlewares/error";

export const viewDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params["id"];
    // console.log(id);

    const doc = await Document.findOne({ docId: id });
    if (!doc) {
      const error: CustomError = new Error("document not found");
      error.statusCode = 401;
      throw error;
    }
    res.json({ data: doc });
  } catch (error) {
    next(error);
  }
};

export const addCollaborators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const docId = req.params.id;
  const { newEditorId, name } = req.body;
  const creator = req.user;
  const doc = await Document.findOne({ docId: docId });
  if (!doc) {
    const error: CustomError = new Error("document not found");
    error.statusCode = 401;
    throw error;
  }
  if (!doc.creator?._id.equals(new mongoose.Types.ObjectId(creator?._id))) {
    const error: CustomError = new Error(
      "you are not authorised to remove collaborators"
    );
    error.statusCode = 401;
    throw error;
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedDoc = await Document.findOneAndUpdate(
      { docId },
      {
        $push: {
          collaborators: {
            _id: new mongoose.Types.ObjectId(newEditorId),
            name: name,
          },
        },
      },
      { new: true, session }
    );
    await session.commitTransaction();
    session.endSession();
    // console.log("addded new contributor");
    
    res.status(201).json({
      success: true,
      data: {
        updatedDoc,
      },
    });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const listcollaborators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params["id"];
  const doc = await Document.findOne({ docId: id });
  if (!doc) {
    const error: CustomError = new Error("document not found");
    error.statusCode = 401;
    throw error;
  }
  res.json({ data: doc.collaborators });
};

export const removecollaborator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const docId = req.params["id"];
  const { userId } = req.body;
  const creator = req.user;
  const doc = await Document.findOne({ docId: docId });
  if (!doc) {
    const error: CustomError = new Error("document not found");
    error.statusCode = 401;
    throw error;
  }
  if (!doc.creator?._id.equals(new mongoose.Types.ObjectId(creator?._id))) {
    const error: CustomError = new Error(
      "you are not authorised to remove collaborators"
    );
    error.statusCode = 401;
    throw error;
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedDoc = await Document.findByIdAndUpdate(
      doc._id,
      { $pull: { collaborators: { _id: new mongoose.Types.ObjectId(userId) } } },
      { new: true , session}
    );
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      success: true,
      data: updatedDoc,
    });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    next(error);
  }
};
