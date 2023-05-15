import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const result = await queryInterface.rawSelect(
      "Settings",
      {
        where: {
          key: "userApiToken"
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
          key: "userApiToken",
          value: uuidv4(),
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
