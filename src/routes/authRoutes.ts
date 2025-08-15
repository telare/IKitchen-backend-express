import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import { getUser, setUser } from "@drizzle/utils/user";
import bcrypt from "bcryptjs";
import {
  generateJWTtokens,
  logInValidationRules,
  setAuthCookies,
  signUpValidationRules,
} from "@shared/utils/auth";
import type { User, UserDB } from "@shared/types/user";
import { validationMiddleware } from "@shared/utils/middlewares";

export const secretKey = process.env["JWT_SECRET"];
if (!secretKey) {
  throw new Error("JWT_SECRET is undefined");
}

const router = Router();
router.use(validationMiddleware);

router.post(
  "/sign-up",
  signUpValidationRules(),
  async (req: Request, res: Response, next:NextFunction) => {
    const inputUser: User = req.body;
    // console.log("Received user data:", name, email, password);

    try {
      const userDBdata: UserDB | undefined = await getUser(inputUser.email);
      // console.log(userDBdata);
      if (userDBdata) {
        return res.status(409).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(inputUser.password, 10);
      const securedUser: User = {
        name: inputUser.name,
        email: inputUser.email,
        password: hashedPassword,
      };
      const settedUser: UserDB | undefined = await setUser(securedUser);
      if (!settedUser) {
        throw new Error("Error during setting user in db");
      }
      const userPayload = { id: settedUser.id };
      const JWTtokens: { accessToken: string; refreshToken: string } =
        generateJWTtokens(userPayload, secretKey);
      setAuthCookies(res, JWTtokens);
      return res.status(201).json({
        message: `User has been created successfully.`,
      });
    } catch (error: unknown) {
      return next(error);
    }
  }
);

router.post(
  "/log-in",
  logInValidationRules(),
  async (req: Request, res: Response,next:NextFunction) => {
    const inputUser: User = req.body;
    try {
      const userDBdata: UserDB | undefined = await getUser(inputUser.email);
      if (!userDBdata) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const hashedPassword: string = userDBdata.password;
      const isPasswordEqual: boolean = await bcrypt.compare(
        inputUser.password,
        hashedPassword
      );
      if (!isPasswordEqual) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const userPayload = { id: userDBdata.id };
      const JWTtokens: {
        accessToken: string;
        refreshToken: string;
      } = generateJWTtokens(userPayload, secretKey);
      setAuthCookies(res, JWTtokens);

      return res.status(200).json({
        message: "Successfully authorized.",
      });
    } catch (error: unknown) {
      return next(error);
    }
  }
);

export default router;
