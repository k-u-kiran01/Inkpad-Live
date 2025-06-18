import { Router } from "express";
import { addCollaborators, listcollaborators, removecollaborator, viewDoc } from "../controllers/documents";
import {exportDoc} from '../controllers/exportController'
import authorise from "../middlewares/auth";
const docsRoute =Router();
// /api/docs/
docsRoute.get('/md/:id', viewDoc)

docsRoute.get('/md/:id/contributors', listcollaborators)

docsRoute.post('/md/:id/contributors', authorise,addCollaborators)

docsRoute.delete('/md/:id/contributors', authorise,removecollaborator)

docsRoute.get('/md/:id/export/:format',exportDoc)

     
export default docsRoute