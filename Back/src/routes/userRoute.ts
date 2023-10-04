import dotenv from "dotenv";
import express from "express";
import {
  confirmEmailRegistration,
  forgetPassword,
  login,
  logout,
  resetPassword,
  signUp,
  updatePassword,
} from "../controllers/authController";

import {
  deleteMe,
  deleteUserByEmail,
  findUserByEmail,
  getAllUser,
  getMe,
  getUser,
  getUserByID,
  updateMe,
} from "../controllers/userController";
import {
  googleLogin,
  googleLoginCallback,
} from "../controllers/googleController";
import { protect } from "../middlewares/userProtection";
import { restrictTo } from "../middlewares/restricRoles";
import { emailVerified } from "../middlewares/emailVerification";

dotenv.config();

const userRouter = express.Router();
userRouter.get("/all", getAllUser);
userRouter.route("/byID/:id").get(getUserByID);

userRouter.post("/signup", signUp);
userRouter.patch("/confirmEmail/:token", confirmEmailRegistration);

userRouter.post("/login", login);

userRouter.get("/google", googleLogin);
userRouter.get("/google/callback", googleLoginCallback);

userRouter.post("/forgotPassword", forgetPassword);
userRouter.patch("/resetPassword/:token", resetPassword);

userRouter.delete("/deleteUser", deleteUserByEmail);

/* After this, everything needs to be authorized */
userRouter.use(protect);
userRouter.use(emailVerified);

userRouter.patch("/updateMyPassword", updatePassword);

userRouter.get("/me", getMe, getUser);
userRouter.patch("/updateMe", updateMe);
userRouter.delete("/deleteMe", deleteMe);

userRouter.post("/logout", logout);

userRouter.post("/getUsersByEmail", findUserByEmail);


/* After this, only admin can make an action */
userRouter.use(restrictTo("admin"));

export default userRouter;
