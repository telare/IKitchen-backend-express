import { Router } from "express";
import { authMiddleware } from "middlewares/auth";
import { validationMiddleware } from "middlewares/general";
import * as RecipesController from "controllers/recipes";
import * as RecipesService from "services/recipes";

export const router = Router();

router.get(
  "/",
  authMiddleware,
  RecipesService.getRecipeValidationRules("/"),
  validationMiddleware,
  RecipesController.getRecipes
);

router.get(
  "/:recipeId",
  authMiddleware,
  RecipesService.getRecipeValidationRules("/:recipeId"),
  validationMiddleware,
  RecipesController.getRecipe
);

router.post(
  "/add",
  authMiddleware,
  RecipesService.getRecipeValidationRules("/add"),
  validationMiddleware,
  RecipesController.postRecipe
);

export default router;
