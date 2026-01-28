"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMd = exports.createMd = exports.getmds = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Document_1 = __importDefault(require("../../db/models/Document"));
const User_1 = __importDefault(require("../../db/models/User"));
const getmds = async (req, res, next) => {
    // const userId = req.params['id'];
    try {
        const user = req.user;
        // console.log(user);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 401;
            throw error;
        }
        res.status(201).json({
            success: true,
            data: user.docs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getmds = getmds;
const createMd = async (req, res, next) => {
    let { doctitle } = req.body;
    const userId = req.user?._id.toString();
    const user = req.user;
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 401;
        throw error;
    }
    if (user.docs.some(doc => doc.title?.toLowerCase().includes(doctitle.toLowerCase()))) {
        doctitle = doctitle + user.docs.length.toString();
    }
    const docdata = {
        title: doctitle,
        userId: userId,
        username: user.name,
    };
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const newDocs = await Document_1.default.create([{
                title: doctitle,
                collaborators: [{ _id: docdata.userId, name: docdata.username }],
                lastEditedBy: { _id: docdata.userId, name: docdata.username },
                creator: { _id: docdata.userId, name: docdata.username },
                docId: user.username + (doctitle || "").split(" ").join(""),
            }], { session });
        const newDoc = newDocs[0];
        await session.commitTransaction();
        // session.endSession();
        session.startTransaction();
        const updateduser = await User_1.default.findByIdAndUpdate(userId, {
            $push: {
                docs: { _id: newDoc._id, title: newDoc.title, docId: newDoc.docId, createdAt: newDoc.createdAt.toISOString() },
            },
        }, { new: true, session });
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            data: newDoc,
        });
        // console.log(newDoc.docId);
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        next(error);
    }
};
exports.createMd = createMd;
const deleteMd = async (req, res, next) => {
    const { docId } = req.params;
    const user = req.user;
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const hasTitle = user.docs.find((doc) => doc.docId === docId);
    if (!hasTitle) {
        const error = new Error("Only Author can delete this md");
        error.statusCode = 402;
        throw error;
        res.status(402).json({ message: error.message });
        return;
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const doc = await Document_1.default.findByIdAndDelete(hasTitle._id);
        await session.commitTransaction();
        session.startTransaction();
        const updateduser = await User_1.default.findByIdAndUpdate(user._id, { $pull: { docs: { _id: hasTitle._id } } }, { new: true, session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, data: updateduser });
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        next(error);
    }
};
exports.deleteMd = deleteMd;
