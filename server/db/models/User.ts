import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required : [true, "User Name is required"],
        trim: true,
        minLength:2 ,
        maxLength :50
    },
    email:{
         type: String,
        required : [true, "User Email is required"],
        trim: true,
        unique:true,
        index:true,
        lowercase:true,
        match: [/\S+@\S+\.\S+/,'please fill a valid email address'],
    },
    password:{
         type: String,
        required : [true, "User Password is required"], 
    },
    username:{
        type:String,
        unique:true,
        required:true,
        index: true
    },
    docs:{
        type: [
            {
               _id:{type: mongoose.Schema.Types.ObjectId , ref : "Document"},
                title: {type:String},
                docId: {type:String},
                createdAt: {type:String}
            }
        ], 
        default: []
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true,
    }
    
} , { timestamps: true})

const User = mongoose.model('User' , userSchema)

export default User
