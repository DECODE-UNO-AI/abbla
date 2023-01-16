import Departament from "../../models/Departament";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

const ListAdminsService = async (): Promise<User[]> => {
  const users = await User.findAll({
    where: {
      profile: "admin"
    },
    attributes: [
      "name",
      "id",
      "email",
      "profile",
      "whatsappNumber",
      "createdAt",
      "startWork",
      "endWork"
    ],
    order: [["createdAt", "DESC"]],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      {
        model: Departament,
        as: "departaments",
        attributes: ["id", "name"]
      }
    ]
  });

  return users;
};

export default ListAdminsService;
