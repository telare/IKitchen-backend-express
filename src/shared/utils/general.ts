import { FieldValidationError, ValidationError } from "express-validator";

export function reqErrorFormatter(error: ValidationError): string {
  let result: string = "";

  if (error.type === "field") {
    const { location, msg, path } = error as FieldValidationError;
    result = `${msg}: '${path}' in ${location}`;
  }

  return result;
}

export function getCacheKey(...args: string[]): string {
  return `${args.join(":")}`;
}
export function getRecipeCacheKey(id:string): string {
  return getCacheKey("recipe", id);
}
export function getUserCacheKey(id:string): string {
  return getCacheKey("user", id);
}

