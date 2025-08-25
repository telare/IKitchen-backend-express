import { Router } from "express";
import { validationMiddleware } from "middlewares/general";
import * as AuthController from "controllers/auth";
import * as AuthService from "services/auth";

const router = Router();

router.post(
  "/sign-up",
  AuthService.signUpValidationRules(),
  validationMiddleware,
  AuthController.signUp
);

router.post(
  "/log-in",
  AuthService.logInValidationRules(),
  validationMiddleware,
  AuthController.logIn
);

export default router;
