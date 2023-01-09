import { Sequelize, Op } from "sequelize";
import Departament from "../../models/Departament";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  userQueues?: number[];
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
}

const ListDepartamentsUsersService = async ({
  searchParam = "",
  pageNumber = "1",
  userQueues = []
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        "$User.name$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("User.name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { email: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ]
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: users } = await User.findAndCountAll({
    attributes: [
      "name",
      "id",
      "email",
      "profile",
      "createdAt",
      "startWork",
      "endWork"
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"],
        where: {
          id: { [Op.or]: userQueues }
        }
      },
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      {
        model: Departament,
        as: "departaments",
        attributes: ["id", "name"]
      }
    ],
    where: {
      ...whereCondition
    }
  });

  const hasMore = count > offset + users.length;

  return {
    users,
    count,
    hasMore
  };
};

export default ListDepartamentsUsersService;
