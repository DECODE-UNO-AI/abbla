import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Campaigns", "mediaType");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Campaigns", "mediaType", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  }
};
