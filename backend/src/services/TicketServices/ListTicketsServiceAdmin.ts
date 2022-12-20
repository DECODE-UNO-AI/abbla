import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import ShowUserService from "../UserServices/ShowUserService";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  adminFilter: Array<string[]>;
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

  // Queue filter
  const queues = adminFilter.filter(e => e.includes("queue"));
  let filterQueues;
  if (
    queues.length === 0 ||
    (queues.length === 1 && queues[0][0] === "queue" && !queues[0][1])
  ) {
    filterQueues = "all";
  } else {
    filterQueues = queues.map(e => e[1]);
  }

  if (filterQueues) {
    if (filterQueues !== "all") {
      whereCondition = {
        ...whereCondition,
        queueId: { [Op.or]: filterQueues }
      };
    }
  }

  // Show All filter

  if (showAll === "true") {
    if (filterQueues !== "all") {
      whereCondition = { queueId: { [Op.or]: [filterQueues] } };
    } else {
      whereCondition = {[Op.or]: [{ userId }, { status: "pending" }],
        status: "pending"
      };
    }
  }

  // Atendentes filter
  const aten = adminFilter.filter(e => e.includes("atendente"));
  let filterAten;
  if (
    aten.length === 0 ||
    (aten.length === 1 && aten[0][0] === "atendente" && !aten[0][1])
  ) {
    filterAten = "all";
  } else {
    filterAten = aten.map(e => e[1]);
  }

  if (filterAten) {
    if (filterAten !== "all") {
      whereCondition = {
        ...whereCondition,
        userId: { [Op.or]: filterAten }
      };
    }
  }

  // Conexão filter
  const cons = adminFilter.filter(e => e.includes("conection"));
  let filterCons;
  if (
    cons.length === 0 ||
    (cons.length === 1 && cons[0][0] === "conection" && !cons[0][1])
  ) {
    filterCons = "all";
  } else {
    filterCons = cons.map(e => e[1]);
  }

  if (filterCons) {
    if (filterCons !== "all") {
      whereCondition = {
        ...whereCondition,
        whatsappId: { [Op.or]: filterCons }
      };
    }
  }

  let includeCondition: Includeable[];
  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"]
    },
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
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);
  console.log(whereCondition)
  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]]
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsServiceAdmin;
