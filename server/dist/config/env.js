"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt_expiry = exports.jwt_secret_key = exports.front_end_url = exports.db_url = exports.NODE_ENV = exports.port = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
_a = process.env, _b = _a.port, exports.port = _b === void 0 ? "5000" : _b, exports.NODE_ENV = _a.NODE_ENV, exports.db_url = _a.db_url, exports.front_end_url = _a.front_end_url, exports.jwt_secret_key = _a.jwt_secret_key, exports.jwt_expiry = _a.jwt_expiry;
