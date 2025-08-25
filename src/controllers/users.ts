import { Request, Response, NextFunction } from "express";
import { UserRequest } from "@shared/types/general";
import {
  findUser,
  findUserFavoriteRecipes,
  findUserRecipes,
  insertUserFavoriteRecipe,
} from "@drizzle/models/user";

export async function getUser(
  req: Request<UserRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const userID: string | undefined = req.params.userID;

    const user = await findUser({
      property: "id",
      value: userID,
    });
    if (!user) {
      throw new Error("An unexpected error during getUser function execution");
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
    const recipes = await findUserRecipes(userID);
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
    const favoriteRecipes = await findUserFavoriteRecipes(userID);
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
      return res.status(400).json({
        message: "userID was not provided",
      });
    }
    const settedFavoriteRecipeID = await insertUserFavoriteRecipe(
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