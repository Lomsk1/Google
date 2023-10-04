import { NextFunction, Request, Response } from "express";
import { getAll, getOne } from "./handlerFactory";
import User from "../models/userModel";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appErrors";

export const getMe = (req: Request, _res: Response, next: NextFunction) => {
  req.params.id = req.user.id;
  next();
};

const filterObj = (obj: Object, ...allowedFields: any[]) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getUser = getOne(User);
export const getAllUser = getAll(User);
export const getUserByID = getOne(User);

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data

    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError("Please, update only information, without Password", 400)
      );
    }

    // 2) Filtered out unwanted fields that are not allowed too be updated
    const filteredBody: any = filterObj(
      req.body,
      "firstName",
      "email",
      "avatar",
      "field",
      "role",
      "describeRoles",
      "purpose",
      "workingSpace"
    ); //if we need to change other fields, just add here

    // if (req.file) {
    // }

    // 3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updateUser,
      },
    });
  }
);

export const deleteUserByEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOneAndDelete({ email: req.body.email });

    if (!user) {
      return next(new AppError("No user found with this Email", 400));
    }
    res.status(204).json({
      status: "success",
    });
  }
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const findUserByEmail = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const searchedEmail = req.body.email;

    const searchDivided = searchedEmail.split(" ").filter(Boolean); // Split the searchedEmail into individual slugs

    const regexConditions = searchDivided.map((s: any) => new RegExp(s, "i"));

    const query = { email: { $in: regexConditions } };

    const data = await User.find(query);

    res.status(200).json({
      status: "success",
      result: data.length,
      data: data,
    });
  }
);
