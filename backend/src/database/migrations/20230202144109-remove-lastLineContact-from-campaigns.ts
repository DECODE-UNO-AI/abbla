import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Campaigns", "lastLineContact");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Campaigns", "lastLineContact", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true
    });
  }
};
