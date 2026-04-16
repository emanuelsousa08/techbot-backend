export class ConversationController {
  constructor(Conversation) {
    this.Conversation = Conversation;
  }

  async getAll(req, res) {
    try {
      const conversations = await this.Conversation.findAll({
        where: { userId: req.user.id },
        order: [["updatedAt", "DESC"]],
      });

      res.json(conversations);
    } catch (error) {
      console.error("Erro ao obter conversas:", error);
      res.status(500).json({ error: "Erro ao obter conversas" });
    }
  }

  async getById(req, res) {
    try {
      const conversation = await this.Conversation.findByPk(req.params.id);

      if (!conversation || conversation.userId !== req.user.id) {
        return res.status(404).json({ error: "Conversa não encontrada" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Erro ao obter conversa:", error);
      res.status(500).json({ error: "Erro ao obter conversa" });
    }
  }

  async create(req, res) {
    try {
      const { conversation } = req.body;

      if (!conversation || !conversation.id) {
        return res.status(400).json({ error: "Conversa inválida" });
      }

      const newConversation = await this.Conversation.create({
        id: conversation.id,
        userId: req.user.id,
        title: conversation.title || null,
        messages: conversation.messages || [],
        metadata: conversation.metadata || {},
      });

      res.status(201).json(newConversation);
    } catch (error) {
      console.error("Erro ao criar conversa:", error);
      res.status(500).json({ error: "Erro ao criar conversa" });
    }
  }

  async update(req, res) {
    try {
      const { conversation } = req.body;
      const conversationId = req.params.id;

      const existingConversation =
        await this.Conversation.findByPk(conversationId);

      if (
        !existingConversation ||
        existingConversation.userId !== req.user.id
      ) {
        return res.status(404).json({ error: "Conversa não encontrada" });
      }

      Object.assign(existingConversation, conversation);
      await existingConversation.save();

      res.json(existingConversation);
    } catch (error) {
      console.error("Erro ao atualizar conversa:", error);
      res.status(500).json({ error: "Erro ao atualizar conversa" });
    }
  }

  async delete(req, res) {
    try {
      const conversation = await this.Conversation.findByPk(req.params.id);

      if (!conversation || conversation.userId !== req.user.id) {
        return res.status(404).json({ error: "Conversa não encontrada" });
      }

      await conversation.destroy();
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
      res.status(500).json({ error: "Erro ao deletar conversa" });
    }
  }
}
