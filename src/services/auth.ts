import jwt from "jsonwebtoken";
import { CookieOptions, Response } from "express";
import { body, ValidationChain } from "express-validator";
import { Strategy } from "passport-google-oauth2";
import * as UserModel from "@drizzle/models/user";

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
export function signUpValidationRules(): ValidationChain[] {
  return [
    // check("body").custom(),
    authReqBodyRules.name,
    authReqBodyRules.email,
    authReqBodyRules.password,
  ];
}
export function logInValidationRules(): ValidationChain[] {
  return [authReqBodyRules.email, authReqBodyRules.password];
}

export function generateJWTtokens(
  payload: string | object,
  secretKey: jwt.Secret
): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(payload, secretKey, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });
  return { accessToken, refreshToken };
}

export function setJWTCookies(
  res: Response,
  tokens: {
    accessToken: string;
    refreshToken: string;
  }
): void {
  const { accessToken, refreshToken } = tokens;
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10000,
  };
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);
}

export function tokenVerify(token: string, secret: string) {
  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Unauthorized: token expired. ${err.message}`);
    }
    throw new Error("Unauthorized: token expired");
  }
}

export function getGoogleStrategy({
  clientID,
  clientSecret,
  callbackURL = "http://localhost:3000/api/v1/auth/log-in/oauth/google/callback",
  scope = ["profile", "email"],
}: {
  clientID: string;
  clientSecret: string;
  callbackURL?: string;
  scope?: string[];
}) {
  return new Strategy(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userDB = await UserModel.findUser({
          name: profile.displayName,
          email: profile.email,
        });
        if (!userDB) {
          const userData = {
            name: (profile.displayName as string).replace(" ", "_"),
            email: profile.email,
          };
          // make as a transaction
          const insertedUser = await UserModel.insertUser(userData);
          if (!insertedUser)
            throw new Error("Inserting user into the Users table failed");
          await UserModel.insertOauthUser({
            provider: "google",
            providerAccountID: profile.id,
            userID: insertedUser.id,
          });
        } else {
          const userDBOauthAccount = await UserModel.findUserOauthAccount(
            userDB.id,
            "google"
          );
          if (!userDBOauthAccount) {
            await UserModel.insertOauthUser({
              provider: "google",
              providerAccountID: profile.id,
              userID: userDB.id,
            });
          } else {
            await UserModel.updateOauthUser({
              provider: "google",
              providerAccountID: profile.id,
              userID: userDB.id,
            });
          }
        }
        const user = {
          name: profile.displayName,
          photo: profile.photos[0].value,
          email: profile.email,
          emailVerified: profile.email_verified,
          accessToken,
          refreshToken,
        };
        done(null, user);
      } catch (err: unknown) {
        if (err instanceof Error) {
          return done(err.message);
        }
        done(err);
      }
    }
  );
}
