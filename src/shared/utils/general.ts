import type { NextFunction } from "express";
import {
  FieldValidationError,
  ValidationError,
  validationResult,
} from "express-validator";
import { Request, Response } from "express";

export function reqErrorFormatter(error: ValidationError): string {
  let result: string = "";

  if (error.type === "field") {
    const { location, msg, path } = error as FieldValidationError;
    result = `${msg}: '${path}' in ${location}`;
  }

  return result;
}
export function errorHandler(error: unknown, res: Response) {
  if (error instanceof Error) {
    console.log(error);
    return res.status(500).json({
      message: `An unexpected error happened, try again later. Error: ${error.message}.`,
    });
  }
}

export function validateRequest(
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
