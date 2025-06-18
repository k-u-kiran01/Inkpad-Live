import { Router } from "express";
import { createMd, deleteMd, getmds } from "../controllers/dashboard";
import authorise from "../middlewares/auth";

const dashboard = Router()
// /api/home/
dashboard.get('/md/:id',authorise,getmds)

dashboard.post('/md/:id',authorise,createMd)

dashboard.delete('/md/:docId',authorise,deleteMd)
 
export default dashboard