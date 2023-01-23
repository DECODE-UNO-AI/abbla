import { Op } from "sequelize";
import Campaign from "../../models/Campaign";

const getCampaigns = async (): Promise<Campaign[]> => {
  const campaigns = await Campaign.findAll({
    where: {
      status: { [Op.or]: ["processing", "scheduled", "timeout"] }
    }
  });

  return campaigns;
};

export default getCampaigns;
