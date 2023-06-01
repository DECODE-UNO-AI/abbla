import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

const getGroupsServices = async () => {
  const contacts = await Contact.findAll({
    where: {
      isGroup: true
    },
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: ["whatsappId"],
        where: {
          whatsappId: {
            [Op.regexp]: "^[0-9]+$"
          }
        }
      }
    ]
  });

  return contacts;
};

export default getGroupsServices;
