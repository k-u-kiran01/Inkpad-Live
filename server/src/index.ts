import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { port, front_end_url, NODE_ENV } from '../config/env'
import authRoute from "./routes/auth";
import connToDb from '../db/connect'
import errorMiddleware from "./middlewares/error";
import dashboard from "./routes/dashboard";
import docsRoute from "./routes/documents";
import { registerDocumentSocket } from "./socket/docSocket"
import cors from 'cors'
import editProfile from "./routes/editProfile";

const app = express();

// CORS configuration - MUST be before routes
const corsOptions = {
  origin: front_end_url,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Body parsers and cookie parser
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


// Health check endpoint (no CORS needed)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: NODE_ENV,
    frontendUrl: front_end_url,
    timestamp: new Date().toISOString(),
    version: '2.0-with-cors-fix'
  });
});

// Test endpoint to verify CORS is working
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowedOrigin: front_end_url,
    timestamp: new Date().toISOString()
  });
});


// Routes
app.use('/api/auth', authRoute)
app.use('/api/home', dashboard)
app.use('/api/docs', docsRoute)
app.use('/api/edit-profile', editProfile)


// Error handler middleware (must be last)
app.use(errorMiddleware)

// Create HTTP server
const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: front_end_url,
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
  }
});

registerDocumentSocket(io)

server.listen(port, async () => {
  console.log(`Server listening on port ${port}`)
  console.log(`CORS enabled for: ${front_end_url}`)
  connToDb()
})

