import express from "express";
import bodyParser from "body-parser";
import { body, validationResult } from "express-validator";
import { getAllUsers, setUser } from "./drizzle/src/utils/user.js";

const app = express();
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT is undefined");
}
app.use(bodyParser.json());

function signUpValidationRules() {
  return [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").trim().isLength({ min: 8 }),
  ];
}
function logInValidationRules() {
  return [
    body("email").isEmail(),
    body("password").trim().isLength({ min: 8 }),
  ];
}

app.post("/api/v1/sign-up", signUpValidationRules(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  console.log("Received user data:", name, email, password);
  try {
    await setUser({ name, email, password });
    res.status(201).json({
      message: `User has been created successfully with next data: ${name}, ${email}, ${password}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: `An unexpected error happened, try again later. Error: ${error.messsage}`,
      });
    }
  }
});

app.listen(3000, () => {
  console.log(`Your server is listening on: http://localhost:${PORT}`);
});
