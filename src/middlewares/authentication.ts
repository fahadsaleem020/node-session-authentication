import { getHttpStatusCode } from "@/utils/http";
import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) return next();

  return res
    .status(getHttpStatusCode("UNAUTHORIZED"))
    .send("authentication required");
};

export const isUnAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isUnauthenticated()) return next();
  return res.status(getHttpStatusCode("NOT_FOUND")).send("session active");
};
