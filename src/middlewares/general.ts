import { NextFunction, Request, Response } from "express";
import { reqErrorFormatter } from "@shared/utils/general";
import { validationResult } from "express-validator";
import { AppError } from "@shared/utils/AppError";


export function validationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req).formatWith(reqErrorFormatter);
  if (!errors.isEmpty()) { 
    const err: AppError = AppError.fromArgs(400, req.originalUrl, undefined, errors.array());
    return res.status(err.getStatus()).json(err.getError());
  }
  next();
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const instance = req.originalUrl;
  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.log(err.message);
    const appErr = AppError.fromArgs(500, instance, `${err.message}.`);
    res.status(appErr.getStatus()).json(appErr.getError());
  } else {
    // eslint-disable-next-line no-console
    console.log(err);
    const appErr = AppError.fromArgs(
      500,
      instance,
      "An unexpected non-error object was thrown."
    );
    res.status(appErr.getStatus()).json(appErr.getError());
  }
}
