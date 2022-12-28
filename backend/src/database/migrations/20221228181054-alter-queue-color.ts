import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint("Queues", "color");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addConstraint("Queues", ["color"], {
      type: "unique",
      name: "color_unique"
    });
  }
};
