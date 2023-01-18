import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Campaigns", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      start: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      message1: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      message2: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      message3: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      message4: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      contacts: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message5: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      mediaType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Campaigns");
  }
};
