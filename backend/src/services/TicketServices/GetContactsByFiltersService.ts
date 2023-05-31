import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { Op } from "sequelize";
import ContactTag from "../../models/ContactTag";

interface ContactSearchData {
  queueIds: string[];
  createdAt: number;
  updatedAt: number;
  atendente: number[];
  connection: number[];
  tag: number[];
}

const getContactsByFiltersService = async ({
  createdAt,
  updatedAt,
  queueIds,
  atendente,
  connection,
  tag
}: ContactSearchData) => {
  const createdDate = new Date(createdAt);
  const updatedDate = new Date(updatedAt);

  createdDate.setHours(createdDate.getHours() - 3);
  updatedDate.setHours(updatedDate.getHours() - 3);

  let ticketQuery = {} as {
    queueId: string[];
    userId: number[];
    whatsappId: number[];
  };

  let contactTagQuery = {} as { tagId: number[] };

  if (queueIds) ticketQuery.queueId = queueIds;
  if (atendente) ticketQuery.userId = atendente;
  if (connection) ticketQuery.whatsappId = connection;
  if (tag) {
    const contactTags = await ContactTag.findAll();

    if (contactTags.length > 0) {
      contactTagQuery.tagId = tag;
    }
  }

  const contacts = await Contact.findAll({
    where: {
      [Op.or]: [
        {
          createdAt: {
            [Op.between]: [createdDate.getTime(), new Date().getTime()]
          },
          updatedAt: {
            [Op.between]: [updatedDate.getTime(), new Date().getTime()]
          }
        }
      ],
      isGroup: 0
    },
    include: [
      {
        model: Ticket,
        as: "tickets",
        where: {
          ...ticketQuery
        },
        attributes: ["queueId"]
      },
      ...(tag && contactTagQuery?.tagId?.length > 0
        ? [
            {
              model: ContactTag,
              as: "contactTags",
              where: {
                tagId: contactTagQuery?.tagId
              }
            }
          ]
        : [])
    ],
    attributes: ["id", "name", "number"]
  });

  if (!contacts) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  return contacts;
};

export default getContactsByFiltersService;
