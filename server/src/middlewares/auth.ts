import jwt from 'jsonwebtoken'
//import { Request, Response, NextFunction } from 'express'
import { jwt_secret_key } from '../../config/env';
import User from '../../db/models/User';
import { RequestHandler } from "express";
declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
    }
  }
}

const authorise:RequestHandler = async (req, res, next) => {
  try {
    // const token = req.headers.authorization?.startsWith('Bearer') 
    //   ? req.headers.authorization.split(' ')[1] 
    //   : null;
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ message: 'Unauthorised (missing token)' });
      return;
    }

    const decoded = jwt.verify(token, jwt_secret_key!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'Unauthorised' });
      return;
    }

    req.user = user;
    next();

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({ message: 'Unauthorised', error: message });
    return; 
  }
};

export default authorise;
