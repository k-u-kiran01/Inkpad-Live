"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const User_1 = __importDefault(require("../../db/models/User"));
const asyncHandler_1 = require("../utils/asyncHandler");
const authorise = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        // const token = req.headers.authorization?.startsWith('Bearer') 
        //   ? req.headers.authorization.split(' ')[1] 
        //   : null;
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: 'Unauthorised (missing token)' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.jwt_secret_key);
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ message: 'Unauthorised' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Authentication failed';
        res.status(401).json({ message: 'Unauthorised', error: message });
        return;
    }
});
exports.default = authorise;
