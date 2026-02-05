import request from "supertest";
import app from "../server.js"; // Assuming server.js exports the app

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("newuser@example.com");
    });

    it("should return 400 for existing user", async () => {
      // First register a user
      await request(app).post("/api/auth/register").send({
        email: "existing@example.com",
        password: "password123",
        name: "Existing User",
      });

      // Try to register again
      const response = await request(app).post("/api/auth/register").send({
        email: "existing@example.com",
        password: "password123",
        name: "Existing User",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid data", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "invalid-email",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      // First register a user
      await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body).toHaveProperty("user");
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      // First login to get tokens
      await request(app).post("/api/auth/register").send({
        email: "logout@example.com",
        password: "password123",
        name: "Logout User",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "logout@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/auth/logout").send({
        refreshToken: loginResponse.body.refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh token successfully", async () => {
      // First login to get tokens
      await request(app).post("/api/auth/register").send({
        email: "refresh@example.com",
        password: "password123",
        name: "Refresh User",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "refresh@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/auth/refresh").send({
        refreshToken: loginResponse.body.refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app).post("/api/auth/refresh").send({
        refreshToken: "invalid-token",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });
  });
});
