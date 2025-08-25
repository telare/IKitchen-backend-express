import * as UserController from "controllers/users";
import * as UserService from "services/users";
import { Router } from "express";
import { authMiddleware } from "middlewares/auth";
import { validationMiddleware } from "middlewares/general";

export const router = Router();

router.get(
  "/:userID",
  authMiddleware,
  UserService.getUserValidationRules("/:userID", "GET"),
  validationMiddleware,
  UserController.getUser
);

router.get(
  "/:userID/favorites",
  authMiddleware,
  UserService.getUserValidationRules("/:userID/favorites", "GET"),
  validationMiddleware,
  UserController.getUserFavorites
);

router.get(
  "/:userID/recipes",
  authMiddleware,
  UserService.getUserValidationRules("/:userID/recipes", "GET"),
  validationMiddleware,
  UserController.getUserRecipes
);

router.post(
  "/:userID/favorites",
  authMiddleware,
  UserService.getUserValidationRules("/:userID/favorites", "POST"),
  validationMiddleware,
  UserController.postUserFavorite
);

export default router;
