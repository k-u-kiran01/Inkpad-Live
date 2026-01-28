"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = __importDefault(require("../middlewares/auth"));
const authRoute = (0, express_1.Router)();
// /api/auth/
authRoute.post('/sign-in', auth_1.signIn);
authRoute.post('/sign-up/', auth_1.signUp);
authRoute.post('/google', auth_1.googleSignIn);
authRoute.post('/change-password', auth_1.changePassword);
authRoute.get('/me/', auth_2.default, auth_1.getUserDetails);
exports.default = authRoute;
