import test, { expect } from "@playwright/test";
import mockUser from "./fixtures/user.json" with { type: "json" };
// update tsconfig to handle aliases there
// linting
import {truncateUsersTable} from "../../src/drizzle/models/user";

test.describe("Sign-up", () => {
  test("sign-up passed", async ({ request }) => {
    const response = await request.post("auth/sign-up", {
      data: mockUser,
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const settedUser = await response.json();
    expect(settedUser).toHaveProperty(
      "message",
      "User has been created successfully."
    );
    const setCookie = response.headers()["set-cookie"];
    expect(setCookie).toBeDefined();
  });

  test("sign-up failed: missing fields", async ({ request }) => {
    const response = await request.post("auth/sign-up", {
      data: { email: mockUser.email }, // missing name and password
    });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test("sign-up failed: duplicate email", async ({ request }) => {
    await request.post("auth/sign-up", { data: mockUser });
    const response = await request.post("auth/sign-up", {
      data: mockUser,
    });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(409);
  });

  test("sign-up failed: invalid password", async ({ request }) => {
    await request.post("auth/sign-up", { data: mockUser });
    const response = await request.post("auth/sign-up", {
      data: { ...mockUser, password: "" },
    });
    const expectedStatusCode: number = 400;

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test("sign-up failed: misspelling field", async ({ request }) => {
    const response = await request.post("auth/sign-up", {
      data: { 
        incorrectFiled: mockUser.name,
        email: mockUser.email,
        password: mockUser.password 
      },
    });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });
  test.afterEach(async ()=>{
    await truncateUsersTable();
  })
});

test.describe("Log-in", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("auth/sign-up", { data: mockUser });
  });

  test("log-in passed", async ({ request }) => {
    const response = await request.post("auth/log-in", {
      data: {
        email: mockUser.email,
        password: mockUser.password,
      },
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const settedUser = await response.json();
    expect(settedUser).toHaveProperty("message", "Successfully authorized.");
    const setCookie = response.headers()["set-cookie"];
    expect(setCookie).toBeDefined();
  });

  test("log-in failed: wrong password", async ({ request }) => {
    const response = await request.post("auth/log-in", {
      data: {
        email: mockUser.email,
        password: "wrongpassword",
      },
    });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test("log-in failed: non-existent email", async ({ request }) => {
    const response = await request.post("auth/log-in", {
      data: {
        email: "notfound@example.com",
        password: "somepassword",
      },
    });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test("log-in failed: missing fields", async ({ request }) => {
    const response = await request.post("auth/log-in", {
      data: { email: mockUser.email }, // missing password
    });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test("log-in failed: misspelling field", async ({ request }) => {
    const response = await request.post("auth/log-in", {
      data: { email: mockUser.email, incorrectField: mockUser.password },
    });
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test.afterAll(async()=>{
    await truncateUsersTable();
  }); 
});