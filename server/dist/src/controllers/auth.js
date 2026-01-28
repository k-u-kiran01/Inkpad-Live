"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSignIn = exports.getUserDetails = exports.changePassword = exports.signIn = exports.signUp = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../../db/models/User"));
const crypto_1 = require("crypto");
const usernameGenerator_1 = __importDefault(require("../usernameGenerator"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const crypto_2 = __importDefault(require("crypto"));
function hashPassword(password) {
    const hash = (0, crypto_1.createHash)("sha256");
    hash.update(password);
    return hash.digest("hex");
}
const comparePassword = (password, hashedPassword) => {
    return hashPassword(password) === hashedPassword;
};
const signUp = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        let { name, email, password } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }
        password = hashPassword(password);
        let username = (0, usernameGenerator_1.default)(name);
        while (await User_1.default.findOne({ username })) {
            const salt = crypto_2.default.randomUUID().slice(0, 5);
            username = (0, usernameGenerator_1.default)(name + salt);
        }
        const newUsers = await User_1.default.create([{ name, email, password, username }], { session: session });
        const newUser = newUsers[0];
        if (!env_1.jwt_secret_key || !env_1.jwt_expiry) {
            const error = new Error("jwt configuration missing");
            error.statusCode = 404;
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id.toString() }, env_1.jwt_secret_key, { expiresIn: env_1.jwt_expiry });
        await session.commitTransaction();
        session.endSession();
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        }).status(201).json({
            success: true,
            message: "User created succesfully",
            data: {
                newUser,
            },
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
exports.signUp = signUp;
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // console.log(email)
        const user = await User_1.default.findOne({ email: email });
        if (!user) {
            const error = new Error("User not Found");
            error.statusCode = 404;
            throw error;
        }
        const isPasswordValid = comparePassword(password, user.password);
        if (!isPasswordValid) {
            const error = new Error("Invalid password");
            error.statusCode = 401;
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, env_1.jwt_secret_key, { expiresIn: env_1.jwt_expiry });
        // console.log(token)
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        }).status(200).json({
            success: true,
            data: {
                token,
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.signIn = signIn;
const changePassword = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { email, oldPass, newPass } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            const error = new Error("User not Found");
            error.statusCode = 404;
            throw error;
        }
        const isPasswordValid = comparePassword(oldPass, user.password);
        if (!isPasswordValid) {
            const error = new Error("Password does not match");
            error.statusCode = 402;
            throw error;
        }
        const hashnewPass = hashPassword(newPass);
        const updatedUser = await User_1.default.findOneAndUpdate({ email: email }, { $set: { password: hashnewPass } }, { new: true, session });
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success: true,
            data: {
                updatedUser,
            },
        });
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        next(error);
    }
};
exports.changePassword = changePassword;
const getUserDetails = (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
};
exports.getUserDetails = getUserDetails;
const googleSignIn = async (req, res, next) => {
    try {
        const { email, name, sub } = req.body;
        let user = await User_1.default.findOne({ email });
        if (!user) {
            const password = hashPassword(crypto_2.default.randomUUID());
            const session = await User_1.default.startSession();
            session.startTransaction();
            try {
                let username = (0, usernameGenerator_1.default)(name);
                while (await User_1.default.findOne({ username })) {
                    const salt = crypto_2.default.randomUUID().slice(0, 5);
                    username = (0, usernameGenerator_1.default)(name + salt);
                }
                user = await User_1.default.create({
                    email: email,
                    name: name,
                    password: password,
                    googleId: sub,
                    username: username,
                });
                session.commitTransaction();
                session.endSession();
            }
            catch (error) {
                session.abortTransaction();
                session.endSession();
                res.status(500).json({ message: "Internal Server Error", error });
                console.log(error);
                return;
            }
        }
        else if (!user.googleId) {
            const error = new Error("The Account associated with this Email has a password. Please login with the password");
            error.statusCode = 400;
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user?._id.toString() }, env_1.jwt_secret_key, { expiresIn: env_1.jwt_expiry });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        }).status(200).json({
            data: {
                user,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
        return;
    }
};
exports.googleSignIn = googleSignIn;
