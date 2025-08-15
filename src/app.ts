import express from "express";
import authRoutes from "./routes/authRoutes";
import { errorMiddleware } from "@shared/utils/middlewares";

export const app = express();
const PORT = process.env["PORT"];
if (!PORT) {
  throw new Error("PORT is undefined");
}

app.use(express.json());
app.use("/api/v1", authRoutes);
app.use(errorMiddleware);

app.listen(3000, () => {
  console.log(`Your server is listening on: http://localhost:${PORT}`);
});
