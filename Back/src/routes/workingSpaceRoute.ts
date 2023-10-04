import dotenv from "dotenv";
import express from "express";
import {
  accessWorkingSpaceInvitation,
  changeWorkingSpaceRole,
  createWorkingSpace,
  deleteMemberFromWorkingSpace,
  deleteWorkingSpace,
  denyWorkingSpaceInvitation,
  getAllWorkingSpace,
  getUsersWorkingSpaces,
  getWorkingSpaceByID,
  sendWorkingSpaceInvitation,
  updateWorkingSpace,
} from "../controllers/workingSpaceHandler";
import { protect } from "../middlewares/userProtection";
import { workingSpaceRestrictTo } from "../middlewares/restricRoles";
import { emailVerified } from "../middlewares/emailVerification";

dotenv.config();

const workingSpaceRoute = express.Router();

/* After this, everything needs to be authorized */
workingSpaceRoute.use(protect);
workingSpaceRoute.use(emailVerified);

/* General */
workingSpaceRoute.route("/").post(createWorkingSpace()).get(getAllWorkingSpace);
workingSpaceRoute
  .route("/byID/:id")
  .get(getWorkingSpaceByID)
  .patch(updateWorkingSpace)
  .delete(deleteWorkingSpace);

/* Working Space */
workingSpaceRoute.get("/user/:userID", getUsersWorkingSpaces());
workingSpaceRoute.patch(
  "/deleteMember",
  workingSpaceRestrictTo("administrator"),
  deleteMemberFromWorkingSpace()
);
workingSpaceRoute.patch(
  "/changeRole",
  workingSpaceRestrictTo("administrator"),
  changeWorkingSpaceRole()
);

/* Invitation */
workingSpaceRoute.post(
  "/sendInvitation",
  workingSpaceRestrictTo("administrator"),
  sendWorkingSpaceInvitation()
);
workingSpaceRoute.patch(
  "/accessInvitationAnswer",
  accessWorkingSpaceInvitation()
);
workingSpaceRoute.delete("/denyInvitationAnswer", denyWorkingSpaceInvitation());

export default workingSpaceRoute;
