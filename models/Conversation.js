import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      messages: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
    },
    {
      tableName: "conversations",
    },
  );

  return Conversation;
};
