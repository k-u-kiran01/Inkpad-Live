"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const auth_1 = __importDefault(require("./routes/auth"));
const connect_1 = __importDefault(require("../db/connect"));
const error_1 = __importDefault(require("./middlewares/error"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const documents_1 = __importDefault(require("./routes/documents"));
const docSocket_1 = require("./socket/docSocket");
const cors_1 = __importDefault(require("cors"));
const editProfile_1 = __importDefault(require("./routes/editProfile"));
const app = (0, express_1.default)();
// CORS configuration - MUST be before routes
const corsOptions = {
    origin: env_1.front_end_url,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};
// Handle preflight requests explicitly
app.options('*', (0, cors_1.default)(corsOptions));
// Apply CORS middleware to all routes
app.use((0, cors_1.default)(corsOptions));
// Body parsers and cookie parser
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/home', dashboard_1.default);
app.use('/api/docs', documents_1.default);
app.use('/api/edit-profile', editProfile_1.default);
// Error handler middleware (must be last)
app.use(error_1.default);
// Create HTTP server
const server = http_1.default.createServer(app);
// Socket.IO with CORS
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.front_end_url,
        methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        credentials: true,
    }
});
(0, docSocket_1.registerDocumentSocket)(io);
server.listen(env_1.port, async () => {
    console.log(`Server listening on port ${env_1.port}`);
    console.log(`CORS enabled for: ${env_1.front_end_url}`);
    (0, connect_1.default)();
});
