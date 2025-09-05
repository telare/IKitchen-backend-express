import { Router } from "express";
import { validationMiddleware } from "middlewares/general";
import * as AuthController from "controllers/auth";
import * as AuthService from "services/auth";
import passport from "passport";

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

router.get(
  "/log-in/oauth/google",
  passport.authenticate("google")
);

router.get(
  "/log-in/oauth/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleOAuth
);

export default router;
