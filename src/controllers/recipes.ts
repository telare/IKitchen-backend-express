import { insertRecipe } from "@drizzle/models/recipe";
import { AuthRequest } from "@shared/types/general";
import { Recipe } from "@shared/types/recipe";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

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

    const recipes = await axios.get(url + searchQuery);
    if (recipes.data) {
      return res.status(200).json(recipes.data);
    } else {
      throw new Error("An unexpected error during a GET recipes");
    }
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
    const recipe = await axios.get(
      `https://api.spoonacular.com/recipes/${recipeId}/information?&apiKey=${apiKey}`
    );
    if (recipe.data) {
      return res.status(200).json(recipe.data);
    } else {
      throw new Error("An unexpected error during a GET random recipes");
    }
  } catch (error: unknown) {
    next(error);
  }
}

export async function postRecipe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const recipe: Recipe = req.body;
    const userID: string | undefined = req.user?.id;
    if (!userID) throw new Error("userId was not provided");
    const recipeID: string | undefined = await insertRecipe(recipe, userID);
    if (!recipeID) {
      throw new Error("An unexpeceted error during the process");
    }
    return res.status(201).json({
      message: `Recipe added successfully! Recipe id: ${recipeID}.`,
    });
  } catch (error: unknown) {
    next(error);
  }
}
