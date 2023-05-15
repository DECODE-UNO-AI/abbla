import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
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
