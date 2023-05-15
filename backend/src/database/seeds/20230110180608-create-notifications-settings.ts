import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const result = await queryInterface.rawSelect(
      "Settings",
      {
        where: {
          key: "notificateOnDisconnect"
        }
      },
      ["key"]
    );

    if (result) {
      return;
    }

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
          key: "notificationWhatsappId",
          value: "null",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "messageOnDisconnect",
          value: "Desconexão",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "notificateUserOnDisconnect",
          value: "disabled",
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
