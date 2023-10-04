import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import userRouter from "./routes/userRoute";
import { errorController } from "./controllers/errorController";
import session from "express-session";
import googleRoute from "./routes/googleRoute";
import cookieParser from "cookie-parser";
import workingSpaceRoute from "./routes/workingSpaceRoute";
// import session from "cookie-session";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:4200",
      "http://localhost:4200",
      "https://lomskproject.in",
    ],
  })
);
app.options("*", cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,

    cookie: {
      secure: true,
      maxAge: 1000 * 60 * 15,
    },
  })
);

// app.use(
//   session({
//     secret: "secret",
//     name: "name",
//     keys: ["key1", "key2"],
//   })
// );

app.use(function (req: Request, _res: Response, next: NextFunction) {
  if (!req.session) {
    return next(new Error("Oh no"));
  }
  next();
});

/* Routes */
app.use("/api/v1/users", userRouter);
app.use("/api/v1/google", googleRoute);

app.use("/api/v1/workingSpace", workingSpaceRoute);

app.use(errorController);

export default app;
