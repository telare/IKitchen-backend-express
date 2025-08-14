import express from "express";
import { getUser, setUser } from "./drizzle/src/utils/user.js";
import bcrypt from "bcryptjs";
import { errorHandler, validateRequest } from "./utils/general.js";
import { generateJWTtokens, logInValidationRules, setAuthCookies, signUpValidationRules } from "./utils/auth.js";

export const app = express();
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT is undefined");
}
export const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET is undefined");
}

app.use(express.json());

app.post(
  "/api/v1/sign-up",
  signUpValidationRules(),
  validateRequest,
  async (req, res) => {
    const inputUser = req.body;
    // console.log("Received user data:", name, email, password);

    try {
      const userDBdata = await getUser(inputUser.email);
      // console.log(userDBdata);
      if (userDBdata) {
        return res.status(409).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(inputUser.password, 10);

      const settedUser = await setUser({
        name: inputUser.name,
        email: inputUser.email,
        password: hashedPassword,
      });
      const userPayload = { id: settedUser.id };
      const JWTtokens = generateJWTtokens(userPayload, secretKey);
      setAuthCookies(res, JWTtokens);
      res.status(201).json({
        message: `User has been created successfully.`,
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

app.post(
  "/api/v1/log-in",
  logInValidationRules(),
  validateRequest,
  async (req, res) => {
    const inputUser = req.body;
    try {
      const userDBdata = await getUser(inputUser.email);
      if (!userDBdata) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const hashedPassword = userDBdata.password;
      const isPasswordEqual = await bcrypt.compare(
        inputUser.password,
        hashedPassword
      );
      if (!isPasswordEqual) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const userPayload = { id: userDBdata.id };
      const JWTtokens = generateJWTtokens(userPayload, secretKey);
      setAuthCookies(res, JWTtokens);

      res.status(200).json({
        message: "Successfully authorized.",
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

app.listen(3000, () => {
  console.log(`Your server is listening on: http://localhost:${PORT}`);
});
