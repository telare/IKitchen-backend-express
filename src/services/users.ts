import { body, param, ValidationChain } from "express-validator";

const usersValidationRules = {
  "/:userID": {
    GET: [
      param("userID").isUUID().withMessage("Parametr userID must be a UUID"),
    ],
  },

  "/:userID/favorites": {
    GET: [
      param("userID").isUUID().withMessage("Parametr userID must be a UUID"),
    ],
    POST: [
      param("userID").isUUID().withMessage("Parametr userID must be a UUID"),
      body("recipeID").isUUID().withMessage("property userID must be a UUID"),
    ],
  },
};

export function getUserValidationRules(
  path: string,
  method: string
): ValidationChain[] {
  switch (path) {
    case "/:userID":
      return usersValidationRules["/:userID"].GET;

    case "/:userID/favoritess":
      if (method === "GET") {
        return usersValidationRules["/:userID/favorites"].GET;
      }
      return usersValidationRules["/:userID/favorites"].POST;
    default:
      return usersValidationRules["/:userID"].GET;
  }
}
