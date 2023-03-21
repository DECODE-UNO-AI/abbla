import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("scheduledMessages", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      ticketId: {
        type: DataTypes.INTEGER,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      inicialDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("scheduledMessages");
  }
};
