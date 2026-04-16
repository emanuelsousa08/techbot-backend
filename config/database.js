import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "techbot.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize;
