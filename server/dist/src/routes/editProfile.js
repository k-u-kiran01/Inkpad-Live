"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../../db/models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const editProfile = (0, express_1.Router)();
editProfile.post("/", async (req, res, next) => {
    const { formDetails, oldEmail } = req.body;
    const { email, username, name } = formDetails;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await User_1.default.findOne({ email: oldEmail });
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ message: "User not found" });
            return;
        }
        let updatedUser;
        if (user.googleId) {
            // Google users cannot change email
            updatedUser = await User_1.default.findOneAndUpdate({ email: oldEmail }, { $set: { name, username } }, { new: true, session });
        }
        else {
            updatedUser = await User_1.default.findOneAndUpdate({ email: oldEmail }, { $set: { name, email, username } }, { new: true, session });
        }
        if (!updatedUser) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ message: "Failed to update user" });
            return;
        }
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, data: updatedUser });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});
editProfile.get("/check-username", async (req, res, next) => {
    try {
        const username = req.query.username;
        const existing = await User_1.default.findOne({ username }).lean();
        res.json({ available: !existing });
    }
    catch (error) {
        next(error);
    }
});
editProfile.get("/check-email", async (req, res, next) => {
    try {
        const email = req.query.email;
        // console.log(email)
        const existing = await User_1.default.findOne({ email }).lean();
        res.json({ available: !existing });
    }
    catch (error) {
        next(error);
    }
});
exports.default = editProfile;
