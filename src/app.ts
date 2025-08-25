import express from "express";
import authRoutes from "./routes/authRoutes";
import recipesRoutes from "./routes/recipesRoutes";
import userRoutes from "./routes/usersRoutes";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "middlewares/general";


export const app = express();
const PORT = process.env["PORT"];
if (!PORT) {
  throw new Error("PORT is undefined");
}

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/recipes", recipesRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorMiddleware);

app.listen(3000, () => {
  console.log(`Your server is listening on: http://localhost:${PORT}`);
});
