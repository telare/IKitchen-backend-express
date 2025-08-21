import { NextFunction, Request, Response, Router } from "express";
import axios from "axios";
import { getRecipeValidationRules } from "@shared/utils/recipes";
import {
  authMiddleware,
  validationMiddleware,
} from "@shared/utils/middlewares";
import { addRecipe } from "@drizzle/utils/recipe";
import { AuthRequest } from "@shared/types/general";
import { Recipe } from "@shared/types/recipe";

const apiKey = process.env["FOOD_API_KEY"];
if (!apiKey) throw new Error("apikey is not defined");

const router = Router();
router.get(
  "/",
  getRecipeValidationRules("/"),
  validationMiddleware,
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
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
    try {
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
);

router.get(
  "/:recipeId",
  authMiddleware,
  getRecipeValidationRules("/:recipeId"),
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const recipeId: string | undefined = req.params["recipeId"];
    if (!recipeId) {
      return res.status(400).json({ message: "Bad request, invalid recipeId" });
    }
    try {
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
);

router.post(
  "/add",
  authMiddleware,
  getRecipeValidationRules("/add"),
  validationMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const recipe: Recipe = req.body;
    if (!recipe) {
      return res.status(400).json({ message: "Bad request, invalid recipe" });
    }
    try {
      const userID: string | undefined = req.user?.id;
      if (!userID) throw new Error("Invalid userID in request.user");
      const recipeID: string | undefined = await addRecipe(recipe, userID);
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
);

export default router;
