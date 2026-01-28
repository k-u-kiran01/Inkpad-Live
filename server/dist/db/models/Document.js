"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const documentSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: ""
    },
    collaborators: [
        {
            _id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String }
        }
    ],
    lastEditedBy: {
        _id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String }
    },
    docId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    creator: {
        _id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
    }
}, { timestamps: true });
const Document = mongoose_1.default.model('Document', documentSchema);
exports.default = Document;
