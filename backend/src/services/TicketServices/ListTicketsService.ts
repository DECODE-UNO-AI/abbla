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
  queueIds: number[];
  tagSelect: [];
  dateOrder: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
  allTicketsCount: number;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber,
  queueIds,
  status,
  date,
  showAll,
  userId,
  withUnreadMessages,
  tagSelect,
  dateOrder
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: { [Op.or]: [queueIds, null] }
  };
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

  if (showAll === "true") {
    whereCondition = { queueId: { [Op.or]: [queueIds, null] } };
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  // Tags Filter
  const selectedTags = tagSelect;
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
    let jsonDate;
    try {
      jsonDate = JSON.parse(date);
    } catch (err) {
      jsonDate = null;
    }
    if (dateOrder === "lastMessage") {
      whereCondition = {
        updatedAt: {
          [Op.between]:
            jsonDate === null
              ? [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
              : [
                  +startOfDay(parseISO(jsonDate[0])),
                  +endOfDay(parseISO(jsonDate[1]))
                ]
        }
      };
    } else {
      whereCondition = {
        createdAt: {
          [Op.between]:
            jsonDate === null
              ? [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
              : [
                  +startOfDay(parseISO(jsonDate[0])),
                  +endOfDay(parseISO(jsonDate[1]))
                ]
        }
      };
    }
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
  const offset = pageNumber ? limit * (+pageNumber - 1) : 0;

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit: pageNumber ? limit : undefined,
    offset: pageNumber ? offset : undefined,
    order: [["updatedAt", "DESC"]]
  });

  const allTicketsCount = await Ticket.count({
    include: includeCondition,
    where: whereCondition
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore,
    allTicketsCount
  };
};

export default ListTicketsService;
