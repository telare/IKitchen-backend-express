import test, { APIResponse, expect } from "@playwright/test";
import mockUser from "./fixtures/user.json" with { type: "json" };
import {truncateUsersTable} from "@drizzle/models/user";
import { AppErrorMessage } from "@shared/utils/AppError";
import { AppResponseMessage } from "@shared/utils/AppResponse";

async function checkBody(response:APIResponse, success:boolean = true) {
  const body = await response.json();
  let properties:(keyof AppErrorMessage | keyof AppResponseMessage)[] = ["status", "title", "detail", "instance", "errors"];
  if(success) properties = ["status", "data", "message", "apiVersion", "pagination", "meta"];
  for (const prop of properties){
    expect(body).toHaveProperty(prop);
  }
}

test.describe("Sign-up", () => {
  test.describe("Passed", () => {
    test("sign-up passed", async ({ request }) => {
      const response = await request.post("auth/sign-up", {
        data: mockUser,
      });
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);
      await checkBody(response);
      const setCookie = response.headers()["set-cookie"];
      expect(setCookie).toBeDefined();
    });
  });

  test.describe("Failed", () => {
    test("missing fields", async ({ request }) => {
      const response = await request.post("auth/sign-up", {
        data: { email: mockUser.email }, // missing name and password
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
      await checkBody(response, false);
    });

    test("duplicate name", async ({ request }) => {
      await request.post("auth/sign-up", { data: mockUser });
      const response = await request.post("auth/sign-up", {
        data: {...mockUser, email:"test_user1@gmail.com"},
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(409);
      checkBody(response,false);
    });

    test("duplicate email", async ({ request }) => {
      await request.post("auth/sign-up", { data: mockUser });
      const response = await request.post("auth/sign-up", {
        data: mockUser,
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(409);
      checkBody(response,false);
    });

    test("invalid password", async ({ request }) => {
      await request.post("auth/sign-up", { data: mockUser });
      const response = await request.post("auth/sign-up", {
        data: { ...mockUser, password: "" },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
      checkBody(response,false);
    });

    test("misspelling field", async ({ request }) => {
      const response = await request.post("auth/sign-up", {
        data: { 
          incorrectFiled: mockUser.name,
          email: mockUser.email,
          password: mockUser.password 
        },
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
      checkBody(response,false);
    });
  });

  test.afterEach(async ()=>{
    await truncateUsersTable();
  });
});

test.describe("Log-in", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("auth/sign-up", { data: mockUser });
  });

  test.describe("Passed", () => {
    test("log-in passed", async ({ request }) => {
      const response = await request.post("auth/log-in", {
        data: {
          email: mockUser.email,
          password: mockUser.password,
        },
      });
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      await checkBody(response);
      const setCookie = response.headers()["set-cookie"];
      expect(setCookie).toBeDefined();
    });
  });

  test.describe("Failed", () => {
    test("wrong password", async ({ request }) => {
      const response = await request.post("auth/log-in", {
        data: {
          email: mockUser.email,
          password: "wrongpassword",
        },
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
      checkBody(response,false);
    });

    test("non-existent email", async ({ request }) => {
      const response = await request.post("auth/log-in", {
        data: {
          email: "notfound@example.com",
          password: "somepassword",
        },
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
      checkBody(response,false);
    });

    test("missing fields", async ({ request }) => {
      const response = await request.post("auth/log-in", {
        data: { email: mockUser.email }, // missing password
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
      checkBody(response,false);
    });

    test("misspelling field", async ({ request }) => {
      const response = await request.post("auth/log-in", {
        data: { email: mockUser.email, incorrectField: mockUser.password },
      });
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
      checkBody(response,false);
    });
  });

  test.afterAll(async()=>{
    await truncateUsersTable();
  }); 
});