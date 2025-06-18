import { Router } from "express";

import {signUp,signIn,googleSignIn, changePassword, getUserDetails} from '../controllers/auth'
import authorise from "../middlewares/auth";

const authRoute= Router();
// /api/auth/

authRoute.post('/sign-in',signIn)
authRoute.post('/sign-up/',signUp)
authRoute.post('/google',googleSignIn)
authRoute.post('/change-password',changePassword)
authRoute.get('/me/',authorise,getUserDetails)
export  default authRoute;