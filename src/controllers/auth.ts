import * as AuthService from "services/auth";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import * as UserModel from "@drizzle/models/user";
import { LocalUser, UserDB } from "@shared/types/user";
import { AppError } from "@shared/utils/AppError";

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const inputUser: {
      name: string;
      email: string;
      password: string;
    } = req.body;
    const secretKey = process.env["JWT_SECRET"];
    if (!secretKey) {
      throw new Error("JWT_SECRET is undefined");
    }
    const userDBdata: UserDB | undefined = await UserModel.findUser({
      property: "email",
      value: inputUser.email,
    });
    if (userDBdata) {
      const error = new AppError(409, req);
      return res.status(error.statusCode).json(error.getError());
    }
    const hashedPassword = await bcrypt.hash(inputUser.password, 10);
    const securedUser: {
      name: string;
      email: string;
      hashedPassword: string;
    } = {
      name: inputUser.name,
      email: inputUser.email,
      hashedPassword,
    };
    const settedUser: UserDB | undefined = await UserModel.insertLocalUser(
      securedUser
    );
    if (!settedUser) {
      const error = new AppError(500, req, "Error during setting user in db.");
      throw error.getError();
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
    const inputUser: {
      name: string;
      email: string;
      password: string;
    } = req.body;
    const secretKey = process.env["JWT_SECRET"];
    if (!secretKey) {
      throw new Error("JWT_SECRET is undefined");
    }
    const userDBdata: UserDB | undefined = await UserModel.findUser({
      property: "email",
      value: inputUser.email,
    });
    if (!userDBdata) {
      const error = new AppError(401, req);
      return res.status(error.statusCode).json(error.getError());
    }

    const userCredentials: LocalUser | undefined =
      await UserModel.findUserLocalAccount(userDBdata.id);
    if (!userCredentials) {
      const error = new AppError(401, req);
      return res.status(error.statusCode).json(error.getError());
    }

    const hashedPassword: string = userCredentials.password;
    const isPasswordEqual: boolean = await bcrypt.compare(
      inputUser.password,
      hashedPassword
    );
    if (!isPasswordEqual) {
      const error = new AppError(401, req);
      return res.status(error.statusCode).json(error.getError());
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
