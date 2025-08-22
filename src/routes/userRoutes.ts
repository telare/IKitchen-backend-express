import {
  getUser,
  getUserFavoriteRecipes,
  setUserFavoriteRecipe,
} from "@drizzle/utils/user";
import {
  authMiddleware,
  validationMiddleware,
} from "@shared/utils/middlewares";
import { getUserValidationRules } from "@shared/utils/users";
import { Request, Response, NextFunction, Router } from "express";
const router = Router();

router.get(
  "/:userID",
  authMiddleware,
  getUserValidationRules("/:userID", "GET"),
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const userID: string | undefined = req.params["userID"];
    if (!userID) {
      return res.status(400).json({
        message: "Parament userID was not provided",
      });
    }
    try {
      const user = await getUser({
        property: "id",
        value: userID,
      });
      if (!user) {
        throw new Error(
          "An unexpected error during getUser function execution"
        );
      }
      return res.status(200).json({
        user,
      });
    } catch (err: unknown) {
      next(err);
    }
  }
);
router.get(
  "/:userID/favorites",
  authMiddleware,
  getUserValidationRules("/:userID/favorites", "GET"),
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const userID: string | undefined = req.params["userID"];
    if (!userID) {
      return res.status(400).json({
        message: "Parament userID was not provided",
      });
    }
    try {
      const favoriteRecipes = await getUserFavoriteRecipes(userID);
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
);

router.post(
  "/:userID/favorites",
  authMiddleware,
  getUserValidationRules("/:userID/favorites", "POST"),
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const userID: string | undefined = req.params["userID"];
    if (!userID) {
      return res.status(400).json({
        message: "Parament userID was not provided",
      });
    }
    const { recipeID }: { recipeID: string | undefined } = req.body;
    if (!recipeID) {
      return res.status(400).json({
        message: "userID was not provided",
      });
    }
    console.log(userID, recipeID);
    try {
      const settedFavoriteRecipeID = await setUserFavoriteRecipe(
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
);

export default router;
