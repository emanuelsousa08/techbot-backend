import sequelize from "./config/database.js";
import UserModel from "./models/User.js";
import ConversationModel from "./models/Conversation.js";

const User = UserModel(sequelize);
const Conversation = ConversationModel(sequelize);

// Definir relacionamentos
User.hasMany(Conversation, { foreignKey: "userId", onDelete: "CASCADE" });
Conversation.belongsTo(User, { foreignKey: "userId" });

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com banco de dados estabelecida");

    await sequelize.sync();
    console.log("✅ Modelos sincronizados com banco de dados");

    return { User, Conversation, sequelize };
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    process.exit(1);
  }
}
