import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Campaigns", "mediaBeforeMessage");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Campaigns", "mediaBeforeMessage", {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    });
  }
};
