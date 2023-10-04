import { NextFunction, Request, Response } from "express";
import WorkingSpace from "../models/workingSpaceModel";
import { catchAsync } from "../utils/catchAsync";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory";
import AppError from "../utils/appErrors";
import WorkingSpaceInvitation from "../models/workingSpaceInvitation";
import User from "../models/userModel";

export const getAllWorkingSpace = getAll(WorkingSpace);
export const getWorkingSpaceByID = getOne(WorkingSpace);
export const deleteWorkingSpace = deleteOne(WorkingSpace);
export const updateWorkingSpace = updateOne(WorkingSpace);

export const createWorkingSpace = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let { name } = req.body;

    const data = await WorkingSpace.create({
      name,
      creator: req.user._id,
      users: [{ user: req.user._id, role: "administrator" }],
    });
    if (!data) next(new AppError("Problem during creating Working Space", 404));

    const userUpdate = await User.findByIdAndUpdate(
      req.user._id,
      {
        workingSpace: data._id,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    if (!userUpdate) next(new AppError("User have not updated", 404));

    res.status(200).json({
      status: "success",
      data,
    });
  });

export const getUsersWorkingSpaces = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query: any = WorkingSpace.find({
      "users.user": req.params.userID,
    });

    const data = await query;

    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data,
    });
  });

export const sendWorkingSpaceInvitation = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { guest } = req.body;

    if (req.user.id === guest)
      next(new AppError("You can NOT send Invitation yourself", 404));

    const isAlreadyMember = req.user.workingSpace.users.some((user: any) =>
      user.user.equals(guest)
    );
    if (isAlreadyMember)
      next(new AppError("This persons is already in your Working Space", 404));

    const existingInvitation = await WorkingSpaceInvitation.findOne({
      host: req.user.id,
      guest: guest,
    });
    if (existingInvitation) {
      return next(
        new AppError("You have already sent Invitation with this person", 404)
      );
    }

    const createInvitation = await WorkingSpaceInvitation.create({
      host: req.user.id,
      guest: guest,
    });
    if (!createInvitation) {
      return next(new AppError("No Invitation Created", 404));
    }

    res.status(200).json({
      status: "success",
    });
  });

export const accessWorkingSpaceInvitation = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { invitationID } = req.body;

    const invitation = await WorkingSpaceInvitation.findById(invitationID);
    if (!invitation) next(new AppError("No document found with that ID", 404));

    const hostUser = await User.findById(invitation.host);
    if (!hostUser) next(new AppError("No host user found with that ID", 404));

    const updateWorkingSpace = await WorkingSpace.findByIdAndUpdate(
      hostUser.workingSpace._id,
      { $addToSet: { users: { user: req.user._id, role: "guest" } } },
      {
        new: true,
        runValidators: false,
      }
    );

    if (!updateWorkingSpace)
      next(new AppError("Something bad happened while updating", 400));

    await WorkingSpaceInvitation.findByIdAndDelete(invitationID);

    res.status(200).json({
      status: "success",
      updateWorkingSpace,
    });
  });

export const denyWorkingSpaceInvitation = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { invitationID } = req.body;

    const invitation = await WorkingSpaceInvitation.findById(invitationID);
    if (!invitation) next(new AppError("No document found with that ID", 404));

    await WorkingSpaceInvitation.findByIdAndDelete(invitationID);

    res.status(200).json({
      status: "success",
    });
  });

export const deleteMemberFromWorkingSpace = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { memberID, workingSpaceId } = req.body;

    const workingSpace = await WorkingSpace.findByIdAndUpdate(
      workingSpaceId,
      {
        $pull: { users: { user: memberID } },
      },
      {
        new: true,
        runValidators: false,
      }
    );

    if (!workingSpace)
      next(new AppError("Something bad happened while deleting", 404));

    res.status(200).json({
      status: "success",
      workingSpace,
    });
  });

export const changeWorkingSpaceRole = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { memberID, workingSpaceId, role } = req.body;

    const updatedWorkingSpace = await WorkingSpace.findOneAndUpdate(
      {
        _id: workingSpaceId,
        "users.user": memberID,
      },
      {
        $set: { "users.$.role": role },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedWorkingSpace) {
      return next(new AppError("Something wrong happened while updating", 404));
    }

    res.status(200).json({
      status: "success",
      updatedWorkingSpace,
    });
  });
