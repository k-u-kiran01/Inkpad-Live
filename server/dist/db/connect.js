"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const connToDb = async () => {
    if (env_1.db_url) {
        try {
            await mongoose_1.default.connect(env_1.db_url);
            console.log('db connected');
        }
        catch (error) {
            console.error('error connecting to db: ', error);
            process.exit(1);
        }
    }
    else
        console.log('db_url is missing');
};
exports.default = connToDb;
