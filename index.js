import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { initializeDatabase } from "./db.js";
import { createUserRoutes } from "./routes/users.js";
import { createConversationRoutes } from "./routes/conversations.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "techbot-secret-key";

app.use(cors());
app.use(express.json());

let User, Conversation;

// Inicializar banco de dados
const { User: UserModel, Conversation: ConversationModel } =
  await initializeDatabase();
User = UserModel;
Conversation = ConversationModel;

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT inválido", err);
    res.status(403).json({ error: "Token inválido" });
  }
};

// Rotas de autenticação e usuários
app.use("/auth", createUserRoutes(User, authenticateToken));

// Endpoint adicional para status da API Key
app.get("/auth/status", authenticateToken, (req, res) => {
  const hasApiKey = Boolean(process.env.GOOGLE_API_KEY);
  res.json({ apiKeyConfigured: hasApiKey });
});

app.post(
  "/api/gemini/generate-content",
  authenticateToken,
  async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res
          .status(400)
          .json({ error: "API Key não configurada no servidor (.env)" });
      }

      const { payload } = req.body;
      if (!payload) {
        return res.status(400).json({ error: "Payload é obrigatório" });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      clearTimeout(timeout);

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data });
      }

      res.status(response.status).json(data);
    } catch (error) {
      console.error("Erro no proxy Gemini:", error);

      if (error instanceof Error && error.name === "AbortError") {
        return res
          .status(504)
          .json({ error: "Tempo limite da requisição Gemini excedido" });
      }

      res.status(500).json({ error: "Erro interno no servidor" });
    }
  },
);

// Rotas de conversas
app.use("/chats", createConversationRoutes(Conversation, authenticateToken));

app.listen(PORT, () => {
  console.log(`🚀 TechBot API Server rodando em http://localhost:${PORT}`);
});
