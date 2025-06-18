"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const authRoute = (0, express_1.Router)();
authRoute.post('/sign-in', auth_1.signIn);
authRoute.post('/sign-up/', auth_1.signUp);
authRoute.post('/sign-out/', auth_1.signOut);
exports.default = authRoute;
