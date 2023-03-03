import express, { Application } from "express";
import Session, { SessionOptions } from "express-session";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import { client } from "@/configs/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { authRoute } from "@/routes/authentication";
import { initializePassportLocal } from "@/configs/passportlocal";

const port = process.env.PORT || 5000;
const app: Application = express();

initializePassportLocal();

const sessionOptions: SessionOptions = {
  secret: process.env.COOKIE_SECRET!,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(client, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionOptions.cookie!.secure = true;
  sessionOptions.cookie!.sameSite = "lax";
  sessionOptions.cookie!.domain = process.env.DOMAIN!;
  sessionOptions.cookie!.httpOnly = true;
}

app.use(
  cors({
    credentials: true,
    origin: process.env.DOMAIN!,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(Session(sessionOptions));
app.use(passport.session());
app.use(morgan("dev"));
app.use("/api", authRoute);

app.listen(port, () => console.log(`server is running on port: ${port}`));
