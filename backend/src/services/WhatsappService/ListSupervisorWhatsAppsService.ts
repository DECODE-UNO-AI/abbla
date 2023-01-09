import { Op } from "sequelize";
import Departament from "../../models/Departament";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

const ListSupervisorWhatsAppsService = async (
  departaments: number[] | undefined
): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: [
          "id",
          "name",
          "color",
          "greetingMessage",
          "startWork",
          "endWork",
          "absenceMessage"
        ],
        include: [
          {
            model: Departament,
            as: "departaments"
          }
        ]
      }
    ],
    where: { "$queues.departaments.id$": { [Op.or]: departaments } }
  });

  return whatsapps;
};

export default ListSupervisorWhatsAppsService;
