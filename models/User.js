import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: [3, 50],
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      joinDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    },
  );

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
