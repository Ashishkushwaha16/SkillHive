const express = require("express");
const request = require("supertest");

const { validateRequest } = require("../middleware/validateRequest");
const { authorizeRoles } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidators");

describe("Validation middleware", () => {
  test("rejects invalid register payload", async () => {
    const app = express();
    app.use(express.json());
    app.post("/register", registerValidation, validateRequest, (req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).post("/register").send({
      name: "A",
      email: "bad-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test("accepts valid login payload", async () => {
    const app = express();
    app.use(express.json());
    app.post("/login", loginValidation, validateRequest, (req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).post("/login").send({
      email: "user@test.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});

describe("RBAC middleware", () => {
  test("blocks non-admin access", async () => {
    const app = express();
    app.use((req, res, next) => {
      req.user = { role: "user" };
      next();
    });
    app.get("/admin", authorizeRoles("admin"), (req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).get("/admin");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden: insufficient permissions");
  });

  test("allows admin access", async () => {
    const app = express();
    app.use((req, res, next) => {
      req.user = { role: "admin" };
      next();
    });
    app.get("/admin", authorizeRoles("admin"), (req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).get("/admin");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
