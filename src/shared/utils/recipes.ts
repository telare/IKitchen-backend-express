import { body, param, query, ValidationChain } from "express-validator";

const recipeValidationRules = {
  "/": [
    query("cuisine")
      .optional()
      .isString()
      .withMessage("cuisine must be a string"),

    query("sort").optional().isString().withMessage("sort must be a string"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("limit must be an integer from 1 to 20"),
    query("diet").optional().isString().withMessage("diet must be a string"),
    query("ingredients")
      .optional()
      .isString()
      .withMessage("ingredients must be a string"),
  ],
  "/:recipeId": [
    param("recipeId").isInt().withMessage("recipeId must be an integer"),
  ],
  "/add": [
    body("title").isString().withMessage("title must be a string"),
    body("description").isString().withMessage("description must be a string"),
    body("imageURL")
      .isArray({ min: 1 })
      .withMessage("imageURL must be a non-empty array"),
    body("servings")
      .isInt({ min: 1 })
      .withMessage("servings must be an integet that is bigger than 0"),

    body("prep").isObject().withMessage("prep must be an object"),
    body("prep.hrs")
      .isInt({ min: 0, max: 24 })
      .withMessage("prep_hrs must be an integet between 0 and 24"),
    body("prep.mins")
      .isInt({ min: 0, max: 59 })
      .withMessage("prep_min must be an integet between 0 and 59"),

    body("cook").isObject().withMessage("cook must be an object"),
    body("cook.hrs")
      .isInt({ min: 0, max: 24 })
      .withMessage("cook_hrs must be an integet between 0 and 24"),
    body("cook.mins")
      .isInt({ min: 0, max: 59 })
      .withMessage("cook_mins must be an integet between 0 and 59"),

    body("ingredients")
      .isArray({ min: 1 })
      .withMessage("Ingredients must be a non-empty array"),
    body("ingredients.*.name")
      .isString()
      .notEmpty()
      .withMessage("Each ingredient must have a name"),
    body("ingredient.*.quantity")
      .isNumeric()
      .withMessage("Quantity must be a number"),
    body("ingredient.*.unit").isString().withMessage("Unit must be a string"),

    body("instructions")
      .isArray({ min: 1 })
      .withMessage("Instructions must be a non-empty array"),
    body("instructions.*.step").isString().withMessage("step must be a string"),
    body("cookTips")
      .isArray({ min: 1 })
      .withMessage("cookTips must be a non-empty array"),
    body("tags")
      .isArray({ min: 1 })
      .withMessage("tags must be a non-empty array"),
  ],
};

export function getRecipeValidationRules(path: string): ValidationChain[] {
  switch (path) {
    case "/":
      return recipeValidationRules["/"];
    case "/:recipeId":
      return recipeValidationRules["/:recipeId"];
    case "/add":
      return recipeValidationRules["/add"];
    default:
      return recipeValidationRules["/"];
  }
}
