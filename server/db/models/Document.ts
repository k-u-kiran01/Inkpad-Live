import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
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
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String } 
        }
    ],
    lastEditedBy: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String } 
    },
    docId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    creator:{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required:true},
        name: { type: String , required:true},
    }
}, { timestamps: true });

const Document = mongoose.model('Document',documentSchema)

export default Document
