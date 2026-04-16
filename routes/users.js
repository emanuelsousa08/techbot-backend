import express from "express";
import { UserController } from "../controllers/UserController.js";

export function createUserRoutes(User, authenticateToken) {
  const router = express.Router();
  const userController = new UserController(User);

  router.post("/register", (req, res) => userController.register(req, res));
  router.post("/login", (req, res) => userController.login(req, res));
  router.get("/me", authenticateToken, (req, res) =>
    userController.getProfile(req, res),
  );
  router.put("/me", authenticateToken, (req, res) =>
    userController.updateProfile(req, res),
  );
  router.delete("/me", authenticateToken, (req, res) =>
    userController.deleteAccount(req, res),
  );

  return router;
}
