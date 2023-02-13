import { Op, Filterable } from "sequelize";
import Campaign from "../../models/Campaign";

interface Filter {
  status?: string[];
  conn?: number[];
}

const ListCampaignService = async (
  searchParam: string,
  filterData: Filter
): Promise<Campaign[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let whereCondition: Filterable["where"] = !searchParam
    ? {
        status: { [Op.not]: "archived" }
      }
    : {};

  if (filterData.status) {
    if (filterData.status.length > 0) {
      whereCondition = {
        status: { [Op.or]: filterData.status }
      };
    } else {
      whereCondition = {};
    }
  }

  if (filterData.conn && filterData.conn.length > 0) {
    whereCondition = {
      ...whereCondition,
      whatsappId: { [Op.or]: filterData.conn }
    };
  }

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      name: { [Op.like]: `%${searchParam.toLocaleLowerCase().trim()}%` }
    };
  }

  const campaignData = await Campaign.findAll({
    where: whereCondition
  });

  return campaignData;
};

export default ListCampaignService;
