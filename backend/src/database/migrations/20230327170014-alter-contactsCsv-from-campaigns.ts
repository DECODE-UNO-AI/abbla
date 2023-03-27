import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Campaigns", "contactsCsv", {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Campaigns", "contactsCsv", {
      type: DataTypes.STRING,
        allowNull: false
    });
  }
};
