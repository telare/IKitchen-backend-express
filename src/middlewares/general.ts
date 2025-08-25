import { NextFunction, Request, Response } from "express";
import { reqErrorFormatter } from "@shared/utils/general";
import { validationResult } from "express-validator";

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
