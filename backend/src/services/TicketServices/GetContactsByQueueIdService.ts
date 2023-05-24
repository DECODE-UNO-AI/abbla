import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const GetContactsByQueueIdService = async (queueIds: string[]) => {
  const contacts = await Contact.findAll({
    include: [
      {
        model: Ticket,
        as: "tickets",
        where: {
          queueId: queueIds
        },
        attributes: ["queueId"]
      }
    ],
    attributes: ["id", "name", "number"]
  });

  if (!contacts) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return contacts;
};

export default GetContactsByQueueIdService;
