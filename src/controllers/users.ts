import { Request, Response, NextFunction } from "express";
import { UserRequest } from "@shared/types/general";
import * as UserModel from "@drizzle/models/user";
import { AppError } from "@shared/utils/AppError";

export async function getUser(
  req: Request<UserRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const userID: string | undefined = req.params.userID;

    const user = await UserModel.findUser({
      property: "id",
      value: userID,
    });
    if (!user) {
      const err: AppError = new AppError(
        500,
        "Error during getting user from a DB."
      );
      return res.status(err.statusCode).json(err.getError());
    }
    return res.status(200).json({
      user,
    });
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
    return res.status(200).json({
      recipes: recipeIDs,
    });
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
    return res.status(200).json({
      favoriteRecipes: recipeIDs,
    });
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
      const err: AppError = new AppError(400, "recipeID was not provided.");
      return res.status(err.statusCode).json(err.getError());
    }
    const userFavoriteRecipes: {
      recipeID: string;
    }[] = await UserModel.findUserFavoriteRecipes(userID);
    if (userFavoriteRecipes.length !== 0) {
      const err: AppError = new AppError(
        409,
        "User has this recipe in favorite."
      );
      return res.status(err.statusCode).json(err.getError());
    }

    const settedFavoriteRecipeID = await UserModel.insertUserFavoriteRecipe(
      recipeID,
      userID
    );
    return res.status(200).json({
      message: `Recipe successfully added to favorite, recipeID: ${settedFavoriteRecipeID}`,
    });
  } catch (err: unknown) {
    next(err);
  }
}
