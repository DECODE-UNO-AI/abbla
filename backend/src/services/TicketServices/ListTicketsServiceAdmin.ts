import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminFilter: any;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
  allTicketsCount: number;
}

const ListTicketsServiceAdmin = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Status Filter
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

  if (filterTags !== "all" && !searchParam) {
    includeCondition = [
      ...includeCondition,
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      },
      {
        model: Contact,
        include: [
          {
            model: ContactTag,
            as: "contactTags",
            attributes: ["tagId"],
            required: true,
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

  // Search Filter
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
          "$messages[0].body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  // Filter Date
  const betweenDate = adminFilter.date;
  const order = adminFilter.dateOrder;
  if (betweenDate) {
    if (order === "createTicket" || order === "" || !order) {
      whereCondition = {
        ...whereCondition,
        createdAt: {
          [Op.between]: [
            +startOfDay(parseISO(betweenDate[0])),
            +endOfDay(parseISO(betweenDate[1]))
          ]
        }
      };
    } else {
      whereCondition = {
        ...whereCondition,
        updatedAt: {
          [Op.between]: [
            +startOfDay(parseISO(betweenDate[0])),
            +endOfDay(parseISO(betweenDate[1]))
          ]
        }
      };
    }
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

  let allTicketsCount = 0;

  if (status !== "closed") {
    allTicketsCount = await Ticket.count({
      include: includeCondition,
      where: whereCondition
    });
  }

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore,
    allTicketsCount
  };
};

export default ListTicketsServiceAdmin;
