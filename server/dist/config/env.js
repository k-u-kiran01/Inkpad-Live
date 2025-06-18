"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.db_url = exports.NODE_ENV = exports.port = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
_a = process.env, exports.port = _a.port, exports.NODE_ENV = _a.NODE_ENV, exports.db_url = _a.db_url;
