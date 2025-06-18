import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: { [key: string]: { message: string } };
}

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("💥 Error caught:", err);

  let customError: CustomError = new Error(err.message || "Server Error");
  customError.statusCode = err.statusCode || 500;
  customError.code = err.code;
  customError.errors = err.errors;

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    customError.message = "Resource not found";
    customError.statusCode = 404;
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    customError.message = "Duplicate field value entered";
    customError.statusCode = 400;
  }

  // Mongoose: validation error
  if (err.name === "ValidationError" && err.errors) {
    customError.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    customError.statusCode = 400;
  }

  res.status(customError.statusCode).json({
    success: false,
    error: customError.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;
