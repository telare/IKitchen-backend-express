import { param, query, ValidationChain } from "express-validator";

const recipeValidationRules = {
  cuisine: query("cuisine")
    .optional()
    .isString()
    .withMessage("cuisine must be a string"),

  sort: query("sort")
    .optional()
    .isString()
    .withMessage("sort must be a string"),

  limit: query("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("limit must be an integer from 1 to 20"),
  diet: query("diet")
    .optional()
    .isString()
    .withMessage("diet must be a string"),
  ingredients: query("ingredients")
    .optional()
    .isString()
    .withMessage("ingredients must be a string"),
  recipeId: param("recipeId")
    .isInt()
    .withMessage("recipeId must be an integer"),
};

export function getRecipeValidationRules(path: string): ValidationChain[] {
  switch (path) {
    case "/":
      return [
        recipeValidationRules.cuisine,
        recipeValidationRules.diet,
        recipeValidationRules.ingredients,
        recipeValidationRules.limit,
        recipeValidationRules.sort,
      ];
    case "/:recipeId":
      return [recipeValidationRules.recipeId];
    default:
      return [
        recipeValidationRules.cuisine,
        recipeValidationRules.diet,
        recipeValidationRules.ingredients,
        recipeValidationRules.limit,
        recipeValidationRules.sort,
      ];
  }
}
