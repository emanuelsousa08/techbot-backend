import jwt from "jsonwebtoken";

export class UserController {
  constructor(User) {
    this.User = User;
  }

  async register(req, res) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "techbot-secret-key";
      const { username, password, name, email } = req.body;

      if (!username || !password || !name || !email) {
        return res
          .status(400)
          .json({ error: "Todos os campos são obrigatórios" });
      }

      const existingUser = await this.User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ error: "Usuário já existe" });
      }

      const userId = `user_${Date.now()}`;
      const user = await this.User.create({
        id: userId,
        username,
        password,
        name,
        email,
        joinDate: new Date(),
      });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        {
          expiresIn: "90d",
        },
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: name?.charAt(0).toUpperCase() || "U",
          joinDate: user.joinDate,
        },
      });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await this.User.findOne({ where: { username } });
      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      const JWT_SECRET = process.env.JWT_SECRET || "techbot-secret-key";
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        {
          expiresIn: "90d",
        },
      );

      res.json({ token });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await this.User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.name?.charAt(0).toUpperCase() || "U",
        joinDate: user.joinDate,
      });
    } catch (error) {
      console.error("Erro ao obter perfil:", error);
      res.status(500).json({ error: "Erro ao obter perfil" });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const user = await this.User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      if (name) user.name = name;
      if (email) user.email = email;

      await user.save();

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.name?.charAt(0).toUpperCase() || "U",
        joinDate: user.joinDate,
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  }

  async deleteAccount(req, res) {
    try {
      const user = await this.User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      await user.destroy();
      res.json({ success: true, message: "Conta deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      res.status(500).json({ error: "Erro ao deletar conta" });
    }
  }
}
