import { Request, Response, NextFunction } from "express";
import { UserRequest } from "@shared/types/general";
import * as UserModel from "@drizzle/models/user";
import { AppError } from "@shared/utils/AppError";
import { UserDB } from "@shared/types/user";
import { AppResponse } from "@shared/utils/AppResponse";

export async function getUser(
  req: Request<UserRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const userID: string | undefined = req.params.userID;

    const user: UserDB | undefined = await UserModel.findUserByID(userID);
    if (!user) {
      const err: AppError = AppError.fromArgs(
        500,
        req.originalUrl,
        "Error during getting user from a DB."
      );
      return res.status(err.getStatus()).json(err.getError());
    }
    const response = AppResponse.fromArgs(
      200,
      user,
      "User fetched successfully."
    );
    return res.status(response.getStatus()).json(response.getMessage());
  } catch (err: unknown) {
    next(err);
  }
}

export async function getUserRecipes(
  req: Request<UserRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const userID = req.params.userID;
    const recipes = await UserModel.findUserRecipes(userID);
    const recipeIDs: string[] = recipes.map((recipe) => {
      return recipe.recipeID;
    });
    const response = AppResponse.fromArgs(
      200,
      recipeIDs,
      "User recipes fetched successfully."
    );
    return res.status(response.getStatus()).json(response.getMessage());
  } catch (err: unknown) {
    next(err);
  }
}

export async function getUserFavorites(
  req: Request<UserRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const userID: string | undefined = req.params.userID;
    const favoriteRecipes = await UserModel.findUserFavoriteRecipes(userID);
    const recipeIDs: string[] = favoriteRecipes.map((recipe) => {
      return recipe.recipeID;
    });
    const response = AppResponse.fromArgs(
      200,
      recipeIDs,
      "User favorite recipes fetched successfully."
    );
    return res.status(response.getStatus()).json(response.getMessage());
  } catch (err: unknown) {
    next(err);
  }
}

export async function postUserFavorite(
  req: Request<UserRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const userID: string | undefined = req.params.userID;

    const { recipeID }: { recipeID: string | undefined } = req.body;
    if (!recipeID) {
      const err: AppError = AppError.fromArgs(
        400,
        req.originalUrl,
        "Recipe ID was not provided."
      );
      return res.status(err.getStatus()).json(err.getError());
    }
    // add check for non existing
    // const recipeInDB = await RecipeModel.findRecipeById(recipeID);

    const userFavoriteRecipes: {
      recipeID: string;
    }[] = await UserModel.findUserFavoriteRecipes(userID);
    if (userFavoriteRecipes.length !== 0) {
      const err: AppError = AppError.fromArgs(
        409,
        req.originalUrl,
        "User has this recipe in favorite."
      );
      return res.status(err.getStatus()).json(err.getError());
    }

    const settedFavoriteRecipeID = await UserModel.insertUserFavoriteRecipe(
      recipeID,
      userID
    );
    // return a setted recipe instead of the ID
    const response = AppResponse.fromArgs(
      200,
      settedFavoriteRecipeID,
      `Recipe successfully added to favorite, recipeID: ${settedFavoriteRecipeID}.`
    );
    return res.status(response.getStatus()).json(response.getMessage());
  } catch (err: unknown) {
    next(err);
  }
}
