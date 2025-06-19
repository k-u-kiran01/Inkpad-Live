import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../../db/models/User";
import { CustomError } from "../middlewares/error";
import { createHash } from "crypto";
import generateUsername from "../usernameGenerator";
import jwt from "jsonwebtoken";
import { jwt_expiry, jwt_secret_key } from "../../config/env";
import crypto from "crypto";
function hashPassword(password: string): string {
  const hash = createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

type signinDetails = {
  email: string;
  password: string;
};
type googleSignIn = {
  email: string;
  name: string;
  sub: string;
};
type signupDetails = {
  name: string;
  email: string;
  password: string;
};
type changePasswordDetails = {
  email: string;
  oldPass: string;
  newPass: string;
};
const comparePassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { name, email, password }: signupDetails = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error: CustomError = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }
    password = hashPassword(password);
    let username = generateUsername(name);
    while (await User.findOne({ username })) {
      const salt = crypto.randomUUID().slice(0, 5);
      username = generateUsername(name + salt);
    }

    const newUsers = await User.create([{ name, email, password, username }],{session:session});
    const newUser = newUsers[0]
    if (!jwt_secret_key || !jwt_expiry) {
      const error: CustomError = new Error("jwt configuration missing");
      error.statusCode = 404;
      throw error;
    }

    const token: string = jwt.sign(
      { userId: newUser._id.toString() },
      jwt_secret_key,
      { expiresIn: jwt_expiry as any }
    );

    await session.commitTransaction();
    session.endSession();
    res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  maxAge: 24 * 60 * 60 * 1000
}).status(201).json({
      success: true,
      message: "User created succesfully",
      data: {
        newUser,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: signinDetails = req.body;
    // console.log(email)
    const user = await User.findOne({ email: email });

    if (!user) {
      const error: CustomError = new Error("User not Found");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid: boolean = comparePassword(password, user.password);

    if (!isPasswordValid) {
      const error: CustomError = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }
    const token: string = jwt.sign(
      { userId: user._id.toString() },
      jwt_secret_key as string,
      { expiresIn: jwt_expiry as any }
    );
    // console.log(token)
    res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000
}).status(200).json({
      success: true,
      data: {
        token,
        user,
      },
    });
    
  } catch (error) {
    next(error);
  }
};


export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, oldPass, newPass }: changePasswordDetails = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error: CustomError = new Error("User not Found");
      error.statusCode = 404;
      throw error;
    }
    const isPasswordValid: boolean = comparePassword(oldPass, user.password);

    if (!isPasswordValid) {
      const error: CustomError = new Error("Password does not match");
      error.statusCode = 402;
      throw error;
    }
    const hashnewPass = hashPassword(newPass);
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: hashnewPass } },
      { new: true , session}
    );
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      success: true,
      data: {
        updatedUser,
      },
    });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getUserDetails = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};

export const googleSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, sub }: googleSignIn = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      const password = hashPassword(crypto.randomUUID());
      const session = await User.startSession();
      session.startTransaction();
      try {
        let username = generateUsername(name);
        while (await User.findOne({ username })) {
          const salt = crypto.randomUUID().slice(0, 5);
          username = generateUsername(name + salt);
        }

        user = await User.create(
            {
              email: email,
              name: name,
              password: password,
              googleId: sub,
              username: username,
            },
        );
        session.commitTransaction();
        session.endSession();
      } catch (error) {
        session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Internal Server Error", error });
        console.log(error);
        
        return;
      }
    } else if (!user.googleId) {
      const error: CustomError = new Error(
        "The Account associated with this Email has a password. Please login with the password"
      );
      error.statusCode = 400;
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    const token = jwt.sign(
      { userId: user?._id.toString() },
      jwt_secret_key as string,
      { expiresIn: jwt_expiry as any }
    );
    res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  maxAge: 24 * 60 * 60 * 1000
}).status(200).json({
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
    return;
  }
};
