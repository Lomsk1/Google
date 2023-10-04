import { Document } from "mongodb";
import { Model } from "mongoose";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import APIFeatures from "../utils/apiFeatures";
import AppError from "../utils/appErrors";

export const getAll = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};

    /*  We will finish this section, when we have main products */
    // if (req.params.receiptId) filter = { receipt: req.params.receiptID };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const data = await features.query;
    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      result: data.length,
      data,
    });
  });

export const getOne = (
  Model: Model<Document>,
  popOptions?: string | { path: string; select?: string }
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query: any = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const data = await query;

    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data,
    });
  });

export const createOne = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    let createdData = req.body;
    /* We will finish this section, when we decided how to upload files */

    // if (req.file) {

    // }
    const data = await Model.create(createdData);

    res.status(201).json({
      status: "success",
      data,
    });
  });

export const updateOne = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    /* We will finish this section, when we decided how to upload files */
    const { body } = req;

    // const { body, file } = req;

    let updatedData = { ...body };
    // const findModel = await Model.findById(req.params.id);

    // if (req.file) {

    // }

    const data = await Model.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data,
    });
  });

export const deleteOne = (Model: Model<Document>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await Model.findByIdAndDelete(req.params.id);

    if (!data) {
      return next(new AppError("No Document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
