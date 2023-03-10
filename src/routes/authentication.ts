import { generateJwt, getHttpStatusCode, verifyCode } from "@/utils/http";
import { User, Verification } from "@prisma/client";
import { client } from "@/configs/client";
import { Router } from "express";
import passport from "passport";
import { hash } from "bcrypt";
import {
  isAuthenticated,
  isUnAuthenticated,
} from "@/middlewares/authentication";

export const authRoute = Router();

authRoute.post(
  "/login",
  isUnAuthenticated,
  passport.authenticate("local"),
  (req, res) => {
    res.send("logged in");
  }
);

authRoute.post("/signup", isUnAuthenticated, async (req, res) => {
  try {
    const user = {
      email: req.body.email as string,
      password: await hash(req.body.password, 10),
    };

    const isUserExists = await client.user.findFirst({
      where: {
        email: { equals: user.email },
      },
    });

    if (isUserExists)
      return res
        .status(getHttpStatusCode("NOT_FOUND"))
        .end("email already exists");

    await client.verification.deleteMany({
      where: {
        email: user.email,
      },
    });

    const token = generateJwt(user);

    const verification: Verification = await client.verification.create({
      data: {
        email: user.email,
        token,
      },
    });

    // send via email (sendgrid);
    if (verification.id) return res.send({ code: verification.id });
  } catch (error) {
    console.log(error);
    res.status(getHttpStatusCode("INTERNAL_SERVER_ERROR")).send(error);
  }
});

authRoute.put(
  "/verify",
  isUnAuthenticated,
  async (req, res, next) => {
    try {
      const { email, password } = await verifyCode(req.body.code as string);
      const user = await client.user.create({
        data: {
          email,
          password,
        },
      });
      req.body = user;
      passport.authenticate("local")(req, res, next);
    } catch (error) {
      console.log(error);
      res.status(getHttpStatusCode("NOT_ACCEPTABLE")).send(error);
    }
  },
  (req, res) => res.send("verified")
);

authRoute.get(
  "/verify/:code",
  async (req, res, next) => {
    try {
      const { email, password } = await verifyCode(req.params.code);
      const user = await client.user.create({
        data: {
          email,
          password,
        },
      });
      req.body = user;
      next();
    } catch (error) {
      console.log(error);
      res
        .status(getHttpStatusCode("NOT_ACCEPTABLE"))
        .send(
          `<img src=https://www.askideas.com/media/50/Funny-Jim-Carrey-Smiling-Face-Picture.jpg alt="session expired" title="sesison expired" /> `
        );
    }
  },
  passport.authenticate("local", { successRedirect: process.env.DOMAIN! })
);

authRoute.delete("/logout", isAuthenticated, (req, res) => {
  req.logout((error) => {
    if (error)
      return res
        .status(getHttpStatusCode("NOT_FOUND"))
        .send("failed to logout");
  });

  res.send("logged out");
});

authRoute.get("/user", isAuthenticated, (req, res) => {
  const { email, contact, address, profilePic } = req.user as User;
  res.json({ email, contact, address, profilePic });
});
