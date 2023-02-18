import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Campaigns", "mediaUrl");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Campaigns", "mediaUrl", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    });
  }
};
