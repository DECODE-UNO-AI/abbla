import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const result = await queryInterface.rawSelect(
      "Users",
      {
        where: {
          name: "Abbla-admin"
        }
      },
      ["name"]
    );

    if (result) {
      return;
    }

    return queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Abbla-admin",
          email: "admin@abbla.com.br",
          passwordHash:
            "$2a$08$WaEmpmFDD/XkDqorkpQ42eUZozOqRCPkPcTkmHHMyuTGUOkI8dHsq",
          profile: "admin",
          tokenVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
