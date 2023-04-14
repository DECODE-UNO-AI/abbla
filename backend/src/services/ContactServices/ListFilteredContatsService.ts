import { Sequelize, Op, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay,parseISO } from "date-fns";
import { intersection } from "lodash";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";

interface Request {
  filterOptions: any;
  pageNumber?: string;
  allContacts?: boolean;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListFilteredContatsService = async ({
  filterOptions,
  pageNumber = "1",
  allContacts = false,
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"]
  if (filterOptions.date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(filterOptions.date[0])), +endOfDay(parseISO(filterOptions.date[1]))]
      }
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);
  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit: allContacts ? undefined : limit,
    offset: allContacts ? undefined : offset,
    order: [["name", "ASC"]],
    include: filterOptions.tags && filterOptions.tags.length > 0 ? [
      {
        model: Tag,
        as: "tags",
        attributes: [],
        where: {
          id: {
            [Op.in]: filterOptions.tags
          }
        }
      }
    ] : undefined
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore: allContacts ? false : hasMore
  };
};

export default ListFilteredContatsService;
