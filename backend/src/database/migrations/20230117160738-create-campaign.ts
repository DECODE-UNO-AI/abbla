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
      inicialDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      startNow: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      mediaBeforeMessage: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      sendTime: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
      },
      lastLineContact: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      delay: {
        type: DataTypes.STRING,
        defaultValue: "30-60",
        allowNull: false
      },
      columnName: {
        type: DataTypes.STRING,
        allowNull: false
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
      message5: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      contactsCsv: {
        type: DataTypes.STRING,
        allowNull: false
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
