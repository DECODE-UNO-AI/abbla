import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const result = await queryInterface.rawSelect(
      "Queues",
      {
        where: {
          name: "padrão"
        }
      },
      ["name"]
    );

    if (result) {
      return;
    }

    return queryInterface.bulkInsert(
      "Queues",
      [
        {
          name: "padrão",
          color: "#000000",
          greetingMessage: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          startWork: "",
          endWork: "",
          absenceMessage: ""
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Queues", {});
  }
};
