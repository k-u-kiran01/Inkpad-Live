import { Router } from "express";
import { addCollaborators, listcollaborators, removecollaborator, viewDoc } from "../controllers/documents";
import {exportDoc} from '../controllers/exportController'
import authorise from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";
const docsRoute =Router();
// /api/docs/
docsRoute.get('/md/:id', viewDoc)

docsRoute.get('/md/:id/contributors', listcollaborators)

docsRoute.post('/md/:id/contributors', authorise,asyncHandler(addCollaborators))

docsRoute.delete('/md/:id/contributors', authorise,removecollaborator)

docsRoute.get('/md/:id/export/:format',exportDoc)

     
export default docsRoute
