import { NextFunction, Request, Response, Router } from "express";
import axios from "axios";

const apiKey = process.env["FOOD_API_KEY"];
if (!apiKey) throw new Error("apikey is not defined");

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const { sort, limit, cuisine, diet, ingredients } = req.query;
  let url: string;
  const searchQuery: URLSearchParams = new URLSearchParams();
  if (!cuisine && !diet && !ingredients) {
    url = "https://api.spoonacular.com/recipes/random?";
    searchQuery.append("sort", sort ? String(sort) : "random");
    searchQuery.append("number", limit ? String(limit) : "5");
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
    console.log(url + searchQuery);
    const recipes = await axios.get(url + searchQuery);
    if (recipes.data) {
      return res.status(200).json(recipes.data);
    } else {
      throw new Error("An unexpected error during a GET recipes");
    }
  } catch (error: unknown) {
    next(error);
  }
});

router.get(
  "/:recipeId",
  async (req: Request, res: Response, next: NextFunction) => {
    const recipeId: string | undefined = req.params["recipeId"];
    if (!recipeId) {
      return res
        .status(400)
        .json({ message: "Bad requestm, invalid recipeId" });
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

export default router;
