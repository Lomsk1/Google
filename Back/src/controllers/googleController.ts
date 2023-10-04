import dotenv from "dotenv";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import passport from "passport";
import jwtDecode from "jwt-decode";
import User from "../models/userModel";
import Email from "../utils/email";
import { signToken } from "./authController";
import AppError from "../utils/appErrors";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.FRONT_BASE_URL
);

const scopes = ["https://www.googleapis.com/auth/calendar"];

export const getGoogle = () =>
  catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });

    res.redirect(url);
  });

export const getGoogleRedirect = () =>
  catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({
      status: "success",
    });
  });

export const googleCreateToken = () =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { code } = req.body;
    const response = await oauth2Client.getToken(code);

    const decodedUser: { email: string; given_name: string; picture: string } =
      await jwtDecode(response.tokens.id_token);

    const existingUser = await User.findOne({ email: decodedUser.email });

    /* If the user is existed and email is not confirmed */
    if (existingUser) {
      if (existingUser.emailConfirmed !== true) {
        existingUser.emailConfirmed = true;
        existingUser.emailConfirmExpires = undefined;
        existingUser.emailConfirmToken = undefined;
      }
      if (!existingUser.firstName)
        existingUser.firstName = decodedUser.given_name;
      if (!existingUser.avatar) existingUser.avatar = decodedUser.picture;
      if (!existingUser.calendarRefreshToken)
        existingUser.calendarRefreshToken = response.tokens.refresh_token;
      await existingUser.save({ validateBeforeSave: false });
    }

    // If the user doesn't exist, create a new user in your database
    if (!existingUser) {
      const newUser = await User.create({
        email: decodedUser.email,
        firstName: decodedUser.given_name,
        avatar: decodedUser.picture,
        password: "Magari123@",
        passwordConfirm: "Magari123@",
        emailConfirmed: true,
        calendarRefreshToken: response.tokens.refresh_token,
      });

      const token = signToken(newUser.id);

      const stepUrl = `${process.env.FRONT_BASE_URL}/register/step`;

      await new Email(newUser, stepUrl).sendWelcome();

      res.status(201).json({
        status: "success",
        response,
        token,
      });
    }

    const token = signToken(existingUser.id);

    res.status(200).json({
      status: "success",
      response,
      token,
    });
  });

export const googleCreateEvent = () =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const {
      summary,
      description,
      location,
      startDateTime,
      endDateTime,
      colorId,
      meetLink,
      attendeesEmails,
      attachmentUrl,
      attachmentTitle,
    } = req.body;

    const refreshToken = req.user.calendarRefreshToken;

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar("v3");

    calendar.events.insert(
      {
        auth: oauth2Client,
        calendarId: "primary",
        requestBody: {
          summary: summary,
          description: description,
          location: location,
          colorId: colorId,
          start: {
            dateTime: new Date(startDateTime).toISOString(),
          },
          end: {
            dateTime: new Date(endDateTime).toISOString(),
          },
          // hangoutLink: meetLink,
          conferenceData: {
            createRequest: {
              requestId: (Math.random() + 1).toString(36).substring(7),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
          attendees: attendeesEmails,
          attachments: [
            {
              fileUrl: attachmentUrl,
              title: attachmentTitle,
            },
          ],
        },
        conferenceDataVersion: meetLink ? 1 : 0,
      },
      (err: any, response: any) => {
        if (err) {
          console.error("Error creating Google Calendar event:", err);
          res.status(500).json({
            status: "fail",
            message: "Error creating Google Calendar event",
            Data: err.errors,
          });
        } else {
          res.status(200).json({
            status: "success",
            response,
          });
        }
      }
    );
  });

export const googleLogin = passport.authenticate("google", {
  scope: ["email", "profile"],
});

export const googleLoginCallback = passport.authenticate("google", {
  failureRedirect: `${process.env.FRONT_BASE_URL}/login/fail`,
  successRedirect: `${process.env.FRONT_BASE_URL}/login/success`,
});

export const getGoogleCalendarEvents = () =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.user.calendarRefreshToken;

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar("v3");

    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: "primary",
      timeMin: "2023-09-10T10:00:00Z",
      timeMax: "2023-10-25T10:00:00Z",
      maxResults: 2500,
      singleEvents: true,
      orderBy: "startTime",
    });

    if (!response) return next(new AppError("No response found", 400));

    res.status(200).json({
      status: "success",
      events: response.data.items,
    });
  });

export const deleteGoogleCalendarEvent = () =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { eventId } = req.params;
    const refreshToken = req.user.calendarRefreshToken;

    // Set up the Google API client with the user's refresh token
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar("v3");

    await calendar.events.delete({
      auth: oauth2Client,
      calendarId: "primary",
      eventId,
    });

    // Respond with a success message
    res.status(204).json({
      status: "success",
      message: "Event deleted successfully",
    });
  });

export const patchGoogleCalendarEvent = () =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const {
      summary,
      description,
      location,
      startDateTime,
      endDateTime,
      colorId,
      meetLink,
      attendeesEmails,
      attachmentUrl,
      attachmentTitle,
    } = req.body;
    const { eventId } = req.params;
    const refreshToken = req.user.calendarRefreshToken;

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar("v3");

    // const existingEvent = await calendar.events.get({
    //   auth: oauth2Client,
    //   calendarId: 'primary',
    //   eventId,
    // });

    // if (req.body.summary) {
    //   existingEvent.data.summary = req.body.summary;
    // }
    // if (req.body.description) {
    //   existingEvent.data.description = req.body.description;
    // }

    calendar.events.patch(
      {
        auth: oauth2Client,
        calendarId: "primary",
        eventId,
        requestBody: {
          summary: summary,
          description: description,
          location: location,
          colorId: colorId,
          start: {
            dateTime: new Date(startDateTime).toISOString(),
          },
          end: {
            dateTime: new Date(endDateTime).toISOString(),
          },
          // hangoutLink: meetLink,
          conferenceData: {
            createRequest: {
              requestId: (Math.random() + 1).toString(36).substring(7),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
          attendees: attendeesEmails,
          attachments: [
            {
              fileUrl: attachmentUrl,
              title: attachmentTitle,
            },
          ],
        },
        conferenceDataVersion: meetLink ? 1 : 0,
      },
      (err: any, response: any) => {
        if (err) {
          console.error("Error Updating Google Calendar event:", err);
          res.status(500).json({
            status: "fail",
            message: "Error Updating Google Calendar event",
            Data: err.errors,
          });
        } else {
          res.status(200).json({
            status: "success",
            response,
          });
        }
      }
    );
  });
