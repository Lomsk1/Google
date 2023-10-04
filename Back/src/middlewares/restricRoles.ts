import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appErrors";
import WorkingSpace from "../models/workingSpaceModel";

export const restrictTo = (...roles: any[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

export const workingSpaceRestrictTo = (...roles: any[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const { workingSpaceId } = req.body;

    const workingSpace = await WorkingSpace.findById(workingSpaceId);

    // Check if the user is associated with a working space
    if (!workingSpace) {
      return next(
        new AppError("You are not a member of any working space", 403)
      );
    }

    // Check if the user's role within the working space allows access
    const userRoleInWorkingSpace = workingSpace.users.find(
      (user: any) => user.user.toString() === req.user._id.toString()
    );

    if (
      !userRoleInWorkingSpace ||
      !roles.includes(userRoleInWorkingSpace.role)
    ) {
      return next(
        new AppError(
          "You do not have permission to perform this action within your working space",
          403
        )
      );
    }
    next();
  };
};
