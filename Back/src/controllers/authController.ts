import crypto from "crypto";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync";
import User from "../models/userModel";
import AppError from "../utils/appErrors";
import Email from "../utils/email";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const signToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const createSendToken = (
  user: any,
  statusCode: number,
  res: Response,
  req: Request
) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      firstName: req.body.firstName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // Create a signup confirmation token
    const confirmationToken = await newUser.createConfirmationToken();

    await newUser.save({ validateBeforeSave: false });

    /* 3) Send it to user's email */
    try {
      const confirmationURL = `${process.env.FRONT_BASE_URL}/register/confirm/${confirmationToken}`;
      await new Email(newUser, confirmationURL).sendEmailActivation();

      res.status(200).json({
        status: "success",
        message: "Signup confirmation link sent to email!",
      });
    } catch (err) {
      newUser.deleteOne();

      return next(
        new AppError(
          "There was an error sending the confirmation email. Try again later!",
          500
        )
      );
    }
  }
);

export const confirmEmailRegistration = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    /* 1) Get token based on the token */
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailConfirmToken: hashedToken,
      emailConfirmExpires: { $gt: Date.now() },
    }).select("+emailConfirmed +active");

    /* 2) If token has not expired, and there is user Save the user*/
    if (!user) {
      return next(new AppError("Token is Invalid or has expired", 400));
    }

    user.emailConfirmed = true;
    user.emailConfirmToken = undefined;
    user.emailConfirmExpires = undefined;

    await user.save({ validateBeforeSave: false });

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res, req);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    /* 1) Check if email and password exist */
    if (!email || !password) {
      return next(new AppError("Please, enter Password and Email", 400));
    }

    /* 2) Check if user exist && password is correct */
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Invalid Password or Email", 401));
    }

    if (user.emailConfirmed !== true) {
      // Create a signup confirmation token
      const confirmationToken = await user.createConfirmationToken();
      await user.save({ validateBeforeSave: false });

      /* 3) Send it to user's email */
      const confirmationURL = `${process.env.FRONT_BASE_URL}/register/confirm/${confirmationToken}`;
      await new Email(user, confirmationURL).sendEmailActivation();

      res.status(200).json({
        status: "success",
        message: "Signup confirmation link sent to email!",
      });
    } else {
      /* 3) If everything is OK, send token to client */
      createSendToken(user, 200, res, req);
    }
  }
);

export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    /* 1) Get user based on POST-ed email */
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return next(
        new AppError("There is no user with this email address.", 404)
      );
    }

    /* 2) Generate the random reset */
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // We don't need to validate our User model with its Required fields

    /* 3) Send it to user's email */
    try {
      const resetURL = `${process.env.FRONT_BASE_URL}/auth/password-forgot/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: "success",
        message: "Link sent to Email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    /* 1) Get token based on the token */
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    /* 2) If token has not expired, and there is user, set the new Password */
    if (!user) {
      return next(new AppError("Token is Invalid or has expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res, req);
  }
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) check if POST-ed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your current password is wrong", 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res, req);
  }
);

export const logout = (_req: Request, res: Response) => {
  // Clear the JWT cookie by setting it to an expired value
  res.cookie("jwt", "expired", {
    expires: new Date(Date.now() - 1),
    httpOnly: true,
  });

  // Optionally, you can redirect the user to a specific page or send a JSON response
  res.status(200).json({ status: "success" });
};
