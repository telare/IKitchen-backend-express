import * as AuthService from "services/auth";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import * as UserModel from "@drizzle/models/user";
import { LocalUser, UserDB } from "@shared/types/user";
import { AppError } from "@shared/utils/AppError";
import { AppResponse } from "@shared/utils/AppResponse";

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
      name: inputUser.name,
      email: inputUser.email,
    });
    if (userDBdata) {
      const error = AppError.fromArgs(409, req.originalUrl);
      return res.status(error.getStatus()).json(error.getError());
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
      const error = AppError.fromArgs(
        500,
        req.originalUrl,
        "Error during setting user in db."
      );
      return res.status(error.getStatus()).json(error.getError());
    }
    const userPayload = { id: settedUser.id };
    const JWTtokens: { accessToken: string; refreshToken: string } =
      AuthService.generateJWTtokens(userPayload, secretKey);
    AuthService.setJWTCookies(res, JWTtokens);
    const response = AppResponse.fromArgs(
      201,
      settedUser,
      "User has been created successfully."
    );
    return res.status(response.getStatus()).json(response.getMessage());
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
      name: inputUser.name,
      email: inputUser.email,
    });
    if (!userDBdata) {
      const error = AppError.fromArgs(401, req.originalUrl);
      return res.status(error.getStatus()).json(error.getError());
    }

    const userCredentials: LocalUser | undefined =
      await UserModel.findUserLocalAccount(userDBdata.id);
    if (!userCredentials) {
      const error = AppError.fromArgs(401, req.originalUrl);
      return res.status(error.getStatus()).json(error.getError());
    }

    const hashedPassword: string = userCredentials.password;
    const isPasswordEqual: boolean = await bcrypt.compare(
      inputUser.password,
      hashedPassword
    );
    if (!isPasswordEqual) {
      const error = AppError.fromArgs(401, req.originalUrl);
      return res.status(error.getStatus()).json(error.getError());
    }

    const userPayload = { id: userDBdata.id };
    const JWTtokens: {
      accessToken: string;
      refreshToken: string;
    } = AuthService.generateJWTtokens(userPayload, secretKey);
    AuthService.setJWTCookies(res, JWTtokens);
    const response = AppResponse.fromArgs(
      200,
      userDBdata,
      "Successfully authorized."
    );
    return res.status(response.getStatus()).json(response.getMessage());
  } catch (error: unknown) {
    return next(error);
  }
}

export async function googleOAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    if (!user) throw new Error("req.user fails");
    const userTokenPayload = user;
    const secretKey: string | undefined = process.env["JWT_SECRET"];
    if (!secretKey) throw new Error("An unexpected jwt secrets");
    const { accessToken, refreshToken } = AuthService.generateJWTtokens(
      userTokenPayload,
      secretKey
    );
    AuthService.setJWTCookies(res, {
      accessToken,
      refreshToken,
    });
    const response = AppResponse.fromArgs(
      201,
      user,
      "Successfully log-in with Google"
    );
    return res.status(response.getStatus()).json(response.getMessage());
  } catch (error: unknown) {
    return next(error);
  }
}
