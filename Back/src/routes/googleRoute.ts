import dotenv from "dotenv";
import express from "express";
import {
  deleteGoogleCalendarEvent,
  getGoogle,
  getGoogleCalendarEvents,
  getGoogleRedirect,
  googleCreateEvent,
  googleCreateToken,
  patchGoogleCalendarEvent,
} from "../controllers/googleController";
import { protect } from "../middlewares/userProtection";

dotenv.config();

const googleRoute = express.Router();

googleRoute.post("/create-token", googleCreateToken());

googleRoute.use(protect);

googleRoute.get("/calendar", getGoogle);
googleRoute.get("/calendar/redirect", getGoogleRedirect);
googleRoute.post("/calendar/create-event", googleCreateEvent());
googleRoute.get("/calendar/get-event", getGoogleCalendarEvents());
googleRoute
  .route("/calendar/primary/events/:eventId")
  .delete(deleteGoogleCalendarEvent())
  .patch(patchGoogleCalendarEvent());

export default googleRoute;
