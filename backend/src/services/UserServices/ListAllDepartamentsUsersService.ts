import { Op } from "sequelize";
import Departament from "../../models/Departament";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

const ListAllDepartamentsUsersService = async (
  queues: number[] = []
): Promise<User[]> => {
  const users = await User.findAll({
    attributes: [
      "name",
      "id",
      "email",
      "whatsappNumber",
      "profile",
      "createdAt",
      "startWork",
      "endWork"
    ],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        where: {
          id: { [Op.or]: queues }
        }
      },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      {
        model: Departament,
        as: "departaments",
        attributes: ["id", "name"]
      }
    ],
    where: {
      profile: "supervisor"
    }
  });

  return users;
};

export default ListAllDepartamentsUsersService;
