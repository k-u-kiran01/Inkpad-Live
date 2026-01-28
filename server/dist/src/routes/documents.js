"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documents_1 = require("../controllers/documents");
const exportController_1 = require("../controllers/exportController");
const auth_1 = __importDefault(require("../middlewares/auth"));
const asyncHandler_1 = require("../utils/asyncHandler");
const docsRoute = (0, express_1.Router)();
// /api/docs/
docsRoute.get('/md/:id', documents_1.viewDoc);
docsRoute.get('/md/:id/contributors', (0, asyncHandler_1.asyncHandler)(documents_1.listcollaborators));
docsRoute.post('/md/:id/contributors', auth_1.default, (0, asyncHandler_1.asyncHandler)(documents_1.addCollaborators));
docsRoute.delete('/md/:id/contributors', auth_1.default, (0, asyncHandler_1.asyncHandler)(documents_1.removecollaborator));
docsRoute.get('/md/:id/export/:format', (0, asyncHandler_1.asyncHandler)(exportController_1.exportDoc));
exports.default = docsRoute;
