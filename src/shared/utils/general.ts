import { FieldValidationError, ValidationError } from "express-validator";

export function reqErrorFormatter(error: ValidationError): string {
  let result: string = "";

  if (error.type === "field") {
    const { location, msg, path } = error as FieldValidationError;
    result = `${msg}: '${path}' in ${location}`;
  }

  return result;
}
