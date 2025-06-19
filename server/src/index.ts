import express  from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import {port } from '../config/env'
import authRoute from "./routes/auth";
import connToDb from '../db/connect'
import errorMiddleware from "./middlewares/error";
import dashboard from "./routes/dashboard";
import docsRoute from "./routes/documents";
import {registerDocumentSocket} from "./socket/docSocket"
import cors from 'cors'
import editProfile from "./routes/editProfile";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://inkpad-live.vercel.app", 
    methods: ["GET", "POST"],
    credentials: true,
  }
});

registerDocumentSocket(io)

app.use(cors({
  origin: "https://inkpad-live.vercel.app",
  credentials: true,
}));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',authRoute)
app.use('/api/home',dashboard)
app.use('/api/docs',docsRoute)
app.use('/api/edit-profile',editProfile)

app.use(errorMiddleware)



server.listen(port,async ()=>{console.log(`server listening on port ${port}`)
    connToDb()
})
