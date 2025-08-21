import { NextFunction, Request, Response } from "express";
import { reqErrorFormatter } from "./general";
import { validationResult } from "express-validator";
import { tokenVerify } from "./auth";
import { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "@shared/types/general";
export function validationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req).formatWith(reqErrorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof Error) {
    console.log(err.message);
    res.status(500).json({
      message: `An unexpected error happened: ${err.message}`,
    });
  } else {
    res.status(500).json({
      message: "An unexpected non-error object was thrown",
    });
  }
}
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
    return res.status(401).json({ message: "Unauthorized: no token. Please, log-in or sign-up." });
  }
  try {
    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) throw new Error("Invalid JWT_SECRET");
    const payload = tokenVerify(accessToken, jwtSecret);
    
    if (!isValidAuthPayload(payload)) {
      throw new Error("Invalid accessToken payload");
    }
    req.user = { id: payload.id };
    next();
  } catch (err: unknown) {
    next(err);
  }
}
// Oauth !
