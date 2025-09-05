import { AuthRequest } from "@shared/types/general";
import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import * as AuthService from "services/auth";

function isValidAuthPayload(
  payload: string | JwtPayload
): payload is { id: string } {
  if (typeof payload === "object") {
    if (payload["id"]) return true;
  }
  return false;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: no token. Please, log-in or sign-up." });
  }
  try {
    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) throw new Error("Invalid JWT_SECRET");
    const payload = AuthService.tokenVerify(accessToken, jwtSecret);

    if (!isValidAuthPayload(payload)) {
      throw new Error("Invalid accessToken payload");
    }
    req.user = { id: payload.id };
    next();
  } catch (err: unknown) {
    next(err);
  }
}
