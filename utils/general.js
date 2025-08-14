import { validationResult } from "express-validator";

export function reqErrorFormatter(error) {
  const { location, msg, path } = error;
  return `${msg}: '${path}' in ${location}`;
}
export function errorHandler(error, res) {
  if (error instanceof Error) {
    console.log(error);
    res.status(500).json({
      message: `An unexpected error happened, try again later. Error: ${error.message}.`,
    });
  }
}

export function validateRequest(req, res, next) {
  const errors = validationResult(req).formatWith(reqErrorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
