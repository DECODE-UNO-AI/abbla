import { Op, fn, where, col, Filterable, Includeable, Model } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import ShowUserService from "../UserServices/ShowUserService";
import Whatsapp from "../../models/Whatsapp";
import ContactTag from "../../models/ContactTag";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  adminFilter: any;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsServiceAdmin = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  date,
  showAll,
  userId,
  adminFilter,
  withUnreadMessages
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }],
    status: "pending"
  };

  const user = await ShowUserService(userId);
  const currentUserQueues = user.queues.map(q => q.id);

  // Queue filter
  const queues = adminFilter.queue;
  let filterQueues;
  if (!queues || queues.length === 0) {
    filterQueues = "all";
  } else {
    filterQueues = queues;
  }

  if (filterQueues !== "all") {
    whereCondition = {
      ...whereCondition,
      queueId: { [Op.or]: filterQueues }
    };
  } else {
    whereCondition = {
      ...whereCondition,
      queueId: { [Op.or]: currentUserQueues }
    };
  }

  // Show All filter

  if (showAll === "true") {
    if (filterQueues !== "all") {
      whereCondition = { queueId: { [Op.or]: filterQueues } };
    }
  } else {
    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      status: "pending",
      queueId: filterQueues
    };
  }

  // Atendentes filter
  const aten = adminFilter.atendente;
  let filterAten;
  if (!aten || aten.length === 0) {
    filterAten = "all";
  } else {
    filterAten = aten;
  }

  if (filterAten !== "all") {
    whereCondition = {
      ...whereCondition,
      userId: { [Op.or]: filterAten }
    };
  }

  // Conexão filter
  const cons = adminFilter.connection;
  let filterCons;
  if (!cons || cons.length === 0) {
    filterCons = "all";
  } else {
    filterCons = cons;
  }

  if (filterCons !== "all") {
    whereCondition = {
      ...whereCondition,
      whatsappId: { [Op.or]: filterCons }
    };
  }

  let includeCondition: Includeable[];
  includeCondition = [
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    }
  ];

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  // Tags Filter
  const selectedTags = adminFilter.tag;
  let filterTags;

  if (!selectedTags || selectedTags.length === 0) {
    filterTags = "all";
  } else {
    filterTags = selectedTags;
  }

  if (filterTags !== "all") {
    includeCondition = [
      ...includeCondition,
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"],
        include: [
          {
            model: ContactTag,
            as: "contactTags",
            attributes: ["tagId"],
            where: { tagId: { [Op.or]: filterTags } }
          }
        ]
      }
    ];
  } else {
    includeCondition = [
      ...includeCondition,
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      }
    ];
  }

  console.log(includeCondition);

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  if (date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }

  if (withUnreadMessages === "true") {
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]]
  });

  const hasMore = count > offset + tickets.length;

  //console.log(tickets[0].contact.contactTags);

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsServiceAdmin;
