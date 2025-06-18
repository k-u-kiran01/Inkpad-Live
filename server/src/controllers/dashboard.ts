import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Document from "../../db/models/Document";
import { CustomError } from "../middlewares/error";
import User from "../../db/models/User";
import { exit } from "process";

type DetailsforDoc = {
  title: string;
  userId: string;
  username: string;
};
export const getmds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const userId = req.params['id'];
  try {
    const user = req.user;
    // console.log(user);
    if (!user) {
      const error: CustomError = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    res.status(201).json({
      success: true,
      data: user.docs,
    });
  } catch (error) {
    next(error);
  }
};
export const createMd = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { doctitle } = req.body;
  const userId = req.user?._id.toString();
  const user = req.user;

  if (!user) {
    const error: CustomError = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }
  if(user.docs.some(doc => doc.title?.toLowerCase().includes(doctitle.toLowerCase()))){
    doctitle = doctitle + user.docs.length.toString()
  }
  const docdata: DetailsforDoc = {
    title: doctitle,
    userId: userId as string,
    username: user.name,
  };
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newDocs = await Document.create([{
      title: doctitle,
      collaborators: [{ _id: docdata.userId, name: docdata.username }],
      lastEditedBy: { _id: docdata.userId, name: docdata.username },
      creator: { _id: docdata.userId, name: docdata.username },
      docId: user.username + (doctitle || "").split(" ").join(""),
    }],{session});
    const newDoc=newDocs[0]
    await session.commitTransaction();
    // session.endSession();

    session.startTransaction();
    const updateduser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          docs: { _id: newDoc._id, title: newDoc.title, docId: newDoc.docId ,createdAt:newDoc.createdAt.toISOString()},
        },
      },
      { new: true ,session}
    );
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      success: true,
      data: newDoc,
    });
    // console.log(newDoc.docId);
    
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    next(error);
  }
};
export const deleteMd = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { docId } = req.params;
  const user = req.user;
  if (!user) {
    const error: CustomError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const hasTitle = user.docs.find((doc) => doc.docId === docId);

  if (!hasTitle) {
    const error: CustomError = new Error("Only Author can delete this md");
    error.statusCode = 402;
    throw error;
    res.status(402).json({message:error.message})
    return;
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const doc = await Document.findByIdAndDelete(hasTitle._id);
    await session.commitTransaction();

    session.startTransaction();
    const updateduser = await User.findByIdAndUpdate(
      user._id,
      { $pull: { docs: { _id: hasTitle._id } } },
      { new: true ,session }
    );
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, data: updateduser });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    next(error);
  }
};
