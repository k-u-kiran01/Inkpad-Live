"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_1 = require("../controllers/dashboard");
const auth_1 = __importDefault(require("../middlewares/auth"));
const dashboard = (0, express_1.Router)();
// /api/home/
dashboard.get('/md/:id', auth_1.default, dashboard_1.getmds);
dashboard.post('/md/:id', auth_1.default, dashboard_1.createMd);
dashboard.delete('/md/:docId', auth_1.default, dashboard_1.deleteMd);
exports.default = dashboard;
