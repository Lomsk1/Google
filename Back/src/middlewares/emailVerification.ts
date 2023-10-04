import { NextFunction, Response } from "express";
import { Request } from "http-proxy-middleware/dist/types";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appErrors";

export const emailVerified = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { emailConfirmed } = req.user;

    if (!emailConfirmed) {
      return next(
        new AppError("Your Email is not activated! Please, activate first", 400)
      );
    }

    next();
  }
);
