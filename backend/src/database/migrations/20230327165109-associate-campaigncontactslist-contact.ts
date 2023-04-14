import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CampaignContactsListAssociates", {
      campaigncontactslistId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      contactId: {
        type: DataTypes.INTEGER,
        primaryKey: true
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
    return queryInterface.dropTable("CampaignContactsListAssociates");
  }
};
