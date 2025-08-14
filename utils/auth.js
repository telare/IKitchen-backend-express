import { body } from "express-validator";
import jwt from "jsonwebtoken";

export const authReqBodyRules = {
  name: body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 4, max: 10 })
    .withMessage("Name must be at least 4-10 characters long")
    .escape(),
  email: body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email address"),
  password: body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
};
export function signUpValidationRules() {
  return [
    // check("body").custom(),
    authReqBodyRules.name,
    authReqBodyRules.email,
    authReqBodyRules.password,
  ];
}
export function logInValidationRules() {
  return [authReqBodyRules.email, authReqBodyRules.password];
}

export function generateJWTtokens(payload, secretKey) {
  const accessToken = jwt.sign(payload, secretKey, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });
  return { accessToken, refreshToken };
}
export function setAuthCookies(res, tokens) {
  const { accessToken, refreshToken } = tokens;
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
  });
}
