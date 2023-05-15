import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const result = await queryInterface.rawSelect(
      "Settings",
      {
        where: {
          key: "visualizeMessage"
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
          key: "visualizeMessage",
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
