import express from "express";
import { ConversationController } from "../controllers/ConversationController.js";

export function createConversationRoutes(Conversation, authenticateToken) {
  const router = express.Router();
  const conversationController = new ConversationController(Conversation);

  router.get("/", authenticateToken, (req, res) =>
    conversationController.getAll(req, res),
  );
  router.get("/:id", authenticateToken, (req, res) =>
    conversationController.getById(req, res),
  );
  router.post("/", authenticateToken, (req, res) =>
    conversationController.create(req, res),
  );
  router.put("/:id", authenticateToken, (req, res) =>
    conversationController.update(req, res),
  );
  router.delete("/:id", authenticateToken, (req, res) =>
    conversationController.delete(req, res),
  );

  return router;
}
