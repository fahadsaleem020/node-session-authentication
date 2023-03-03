import passport from "passport";
import { User } from "@prisma/client";
import { getUserByEmail, getUserById } from "@/controllers/user";
import { compare } from "bcrypt";
import { Strategy, VerifyFunctionWithRequest } from "passport-local";

const verify: VerifyFunctionWithRequest = async (
  req,
  email,
  password,
  done
) => {
  try {
    const user = await getUserByEmail(email);

    if (user?.password === password) return done(null, user);
    if (!user) return done(null, false);
    const isPasswordMatched = await compare(password, user.password);
    if (!isPasswordMatched) return done(null, false);
    return done(null, user);
  } catch (error) {
    console.log(error);
    return done(error);
  }
};

export const initializePassportLocal = () => {
  passport.use(
    new Strategy({ usernameField: "email", passReqToCallback: true }, verify)
  );
  passport.serializeUser((user, done) => {
    return done(null, (user as User).id);
  });
  passport.deserializeUser(async (id, done) => {
    return done(null, await getUserById(id as string));
  });
};
