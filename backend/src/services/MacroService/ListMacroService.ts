import { Sequelize } from "sequelize";
import Macro from "../../models/Macro";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  macros: Macro[];
  count: number;
  hasMore: boolean;
}

const ListMacroService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    name: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("name")),
      "LIKE",
      `%${searchParam.toLowerCase().trim()}%`
    )
  };
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: macros } = await Macro.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + macros.length;

  return {
    macros,
    count,
    hasMore
  };
};

export default ListMacroService;
