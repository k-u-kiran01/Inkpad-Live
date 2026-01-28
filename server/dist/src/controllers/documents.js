"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removecollaborator = exports.listcollaborators = exports.addCollaborators = exports.viewDoc = void 0;
const Document_1 = __importDefault(require("../../db/models/Document"));
const mongoose_1 = __importDefault(require("mongoose"));
const viewDoc = async (req, res, next) => {
    try {
        const id = req.params["id"];
        // console.log(id);
        const doc = await Document_1.default.findOne({ docId: id });
        if (!doc) {
            const error = new Error("document not found");
            error.statusCode = 401;
            throw error;
        }
        res.json({ data: doc });
    }
    catch (error) {
        next(error);
    }
};
exports.viewDoc = viewDoc;
const addCollaborators = async (req, res, next) => {
    const docId = req.params.id;
    const { newEditorId, name } = req.body;
    const creator = req.user;
    const doc = await Document_1.default.findOne({ docId: docId });
    if (!doc) {
        const error = new Error("document not found");
        error.statusCode = 401;
        throw error;
    }
    if (!doc.creator?._id.equals(new mongoose_1.default.Types.ObjectId(creator?._id))) {
        const error = new Error("you are not authorised to remove collaborators");
        error.statusCode = 401;
        throw error;
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const updatedDoc = await Document_1.default.findOneAndUpdate({ docId }, {
            $push: {
                collaborators: {
                    _id: new mongoose_1.default.Types.ObjectId(newEditorId),
                    name: name,
                },
            },
        }, { new: true, session });
        await session.commitTransaction();
        session.endSession();
        // console.log("addded new contributor");
        res.status(201).json({
            success: true,
            data: {
                updatedDoc,
            },
        });
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        next(error);
    }
};
exports.addCollaborators = addCollaborators;
const listcollaborators = async (req, res, next) => {
    const id = req.params["id"];
    const doc = await Document_1.default.findOne({ docId: id });
    if (!doc) {
        const error = new Error("document not found");
        error.statusCode = 401;
        throw error;
    }
    res.json({ data: doc.collaborators });
};
exports.listcollaborators = listcollaborators;
const removecollaborator = async (req, res, next) => {
    const docId = req.params["id"];
    const { userId } = req.body;
    const creator = req.user;
    const doc = await Document_1.default.findOne({ docId: docId });
    if (!doc) {
        const error = new Error("document not found");
        error.statusCode = 401;
        throw error;
    }
    if (!doc.creator?._id.equals(new mongoose_1.default.Types.ObjectId(creator?._id))) {
        const error = new Error("you are not authorised to remove collaborators");
        error.statusCode = 401;
        throw error;
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const updatedDoc = await Document_1.default.findByIdAndUpdate(doc._id, { $pull: { collaborators: { _id: new mongoose_1.default.Types.ObjectId(userId) } } }, { new: true, session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            data: updatedDoc,
        });
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        next(error);
    }
};
exports.removecollaborator = removecollaborator;
