import jwt from "jsonwebtoken";
import { promisify } from "util";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appErrors";
import User from "../models/userModel";

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    /* 1) Getting token and check if it's there */
    let token: string;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not authorized! Please, log in first", 401)
      );
    }

    /* 2) Verification token */

    const verify = promisify<string, string>(jwt.verify);

    const decoded: any = await verify(token, process.env.JWT_SECRET);

    /* 3) Check if user still exist */
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist",
          401
        )
      );
    }

    /* 4) Check if user changed password after the JWT was issued */
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password! Please log in again", 401)
      );
    }

    /* GRANT ACCESS TO PROTECTED ROUTE */
    req.user = currentUser;
    next();
  }
);
