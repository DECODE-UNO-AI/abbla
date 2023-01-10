import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Settings",
      [
        {
          key: "notificateOnDisconnect",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "notificateDepartamentOnDisconnect",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "notificateAdminOnDisconnect",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "NotificationWhatsappId",
          value: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {});
  }
};
