import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Campaigns", "contactsNumber", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Campaigns", "contactsNumber");
  }
};
