import * as AuthService from "services/auth";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { findUser, insertUser } from "@drizzle/models/user";
import { User, UserDB } from "@shared/types/user";


export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const inputUser: User = req.body;
    const secretKey = process.env["JWT_SECRET"];
    if (!secretKey) {
      throw new Error("JWT_SECRET is undefined");
    }
    const userDBdata: UserDB | undefined = await findUser({
      property: "email",
      value: inputUser.email,
    });
    // console.log(userDBdatsa);
    if (userDBdata) {
      return res.status(409).json({ message: "User has already exists" });
    }
    const hashedPassword = await bcrypt.hash(inputUser.password, 10);
    const securedUser: User = {
      name: inputUser.name,
      email: inputUser.email,
      password: hashedPassword,
    };
    const settedUser: UserDB | undefined = await insertUser(securedUser);
    if (!settedUser) {
      throw new Error("Error during setting user in db");
    }
    const userPayload = { id: settedUser.id };
    const JWTtokens: { accessToken: string; refreshToken: string } =
      AuthService.generateJWTtokens(userPayload, secretKey);
    AuthService.setAuthCookies(res, JWTtokens);
    return res.status(201).json({
      message: `User has been created successfully.`,
    });
  } catch (error: unknown) {
    return next(error);
  }
}

export async function logIn(req: Request, res: Response, next: NextFunction) {
  try {
    const inputUser: User = req.body;
    const secretKey = process.env["JWT_SECRET"];
    if (!secretKey) {
      throw new Error("JWT_SECRET is undefined");
    }
    const userDBdata: UserDB | undefined = await findUser({
      property: "email",
      value: inputUser.email,
    });
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
    } = AuthService.generateJWTtokens(userPayload, secretKey);
    AuthService.setAuthCookies(res, JWTtokens);
    return res.status(200).json({
      message: "Successfully authorized.",
    });
  } catch (error: unknown) {
    return next(error);
  }
}
