import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const result = await queryInterface.rawSelect(
      "Settings",
      {
        where: {
          key: "userCreation"
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
          key: "userCreation",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "CheckMsgIsGroup",
          value: "enabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "call",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "sideMenu",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "timeCreateNewTicket",
          value: "10",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "closeTicketApi",
          value: "disabled",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: "darkMode",
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
