import * as RecipeModel from "@drizzle/models/recipe";
import { AuthRequest } from "@shared/types/general";
import { InputRecipe, Recipe } from "@shared/types/recipe";
import { AppError } from "@shared/utils/AppError";
import { getRecipeCacheKey } from "@shared/utils/general";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import initRedisClient from "lib/redisClient";

export async function getRecipes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = process.env["FOOD_API_KEY"];
    if (!apiKey) throw new Error("apikey is not defined");
    const { sort, limit, cuisine, diet, ingredients } = req.query;
    let url: string;
    const searchQuery: URLSearchParams = new URLSearchParams();
    if (!cuisine && !diet && !ingredients) {
      url = "https://api.spoonacular.com/recipes/random?";
      searchQuery.append("sort", sort ? String(sort) : "random");
      searchQuery.append("limit", limit ? String(limit) : "5");
    } else {
      url = "https://api.spoonacular.com/recipes/complexSearch?";
      searchQuery.append("cuisine", cuisine ? String(cuisine) : "italian");
      searchQuery.append("diet", diet ? String(diet) : "vegetarian");
      searchQuery.append(
        "includeIngredients",
        ingredients ? String(ingredients) : "tomato,cheese"
      );
    }
    searchQuery.append("apiKey", apiKey);
    // error handling !
    const recipes = await axios.get(url + searchQuery);

    return res.status(200).json(recipes.data);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getRecipe(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = process.env["FOOD_API_KEY"];
    if (!apiKey) throw new Error("apikey is not defined");
    const recipeId: string | undefined = req.params["recipeId"]!;
    const redisClient = await initRedisClient();
    if (!redisClient) throw new Error("Unexpected redis client");
    const cacheKey: string = getRecipeCacheKey(recipeId);
    const cachedRecipe: string | null = await redisClient.get(cacheKey);
    if (cachedRecipe) return res.status(200).json(JSON.parse(cachedRecipe));

    const recipe = await axios.get(
      `https://api.spoonacular.com/recipes/${recipeId}/information?&apiKey=${apiKey}`
    );
    const hashData = JSON.stringify(recipe.data);
    const isCachedRecipe: string | null = await redisClient.set(
      cacheKey,
      hashData,
      {
        EX: 60,
      }
    );
    // eslint-disable-next-line no-console
    console.log(`Cached: ${isCachedRecipe}`);

    return res.status(200).json(recipe.data);
  } catch (error: unknown) {
    next(error);
  }
}

// export async function getRecipeById(req: Request, res: Response, next: NextFunction) {
//   try {
//     const apiKey = process.env["FOOD_API_KEY"];
//     if (!apiKey) throw new Error("apikey is not defined");
//     const recipeId: string | undefined = req.params["recipeId"]!;
//     const recipe = await findRecipeById(recipeId);
//     if (recipe) {
//       return res.status(200).json(recipe);
//     } else {
//       throw new Error("An unexpected error during a GET random recipes");
//     }
//   } catch (error: unknown) {
//     next(error);
//   }
// }

export async function postRecipe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const recipe: InputRecipe = req.body;
    const userID: string | undefined = req.user?.id;
    if (!userID) {
      const err: AppError = new AppError(400, req, "userID was not provided.");
      return res.status(err.statusCode).json(err.getError());
    }

    const recipeDb: Recipe | undefined = await RecipeModel.findRecipeByTitle(
      recipe.title
    );
    if (recipeDb) {
      const err: AppError = new AppError(409, req, "Recipe already exists.");
      return res.status(err.statusCode).json(err.getError());
    }

    const recipeID: string | undefined = await RecipeModel.insertRecipe(
      recipe,
      userID
    );
    if (!recipeID) {
      const err: AppError = new AppError(
        500,
        req,
        "Error during insert recipe to a DB."
      );
      return res.status(err.statusCode).json(err.getError());
    }

    return res.status(201).json({
      message: `Recipe added successfully! Recipe id: ${recipeID}.`,
    });
  } catch (error: unknown) {
    next(error);
  }
}
