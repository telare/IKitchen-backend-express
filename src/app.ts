/* eslint-disable no-console */
import express from "express";
import authRoutes from "./routes/authRoutes";
import recipesRoutes from "./routes/recipesRoutes";
import userRoutes from "./routes/usersRoutes";
import cookieParser from "cookie-parser";
import passport from "passport";
import { errorMiddleware } from "middlewares/general";
import { getGoogleStrategy } from "services/auth";
import initRedisClient from "lib/redisClient";
import { limiter } from "lib/rateLimiter";

export const app = express();
const PORT = process.env["PORT"];
const googleClientID = process.env["GOOGLE_CLIENT_ID"];
const googleClientSecret = process.env["GOOGLE_CLIENT_SECRET"];
if (!PORT) {
  throw new Error("PORT is undefined");
}
if (!googleClientID || !googleClientSecret)
  throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is undefined");

await initRedisClient();

app.use(limiter);

app.use(passport.initialize());
passport.use(
  getGoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/recipes", recipesRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorMiddleware);

app.listen(3000, async () => {
  console.log(`Your server is listening on: http://localhost:${PORT}/api`);
});
