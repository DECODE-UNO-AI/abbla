import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

const ShowCampaignService = async (
  campaignId: string | number
): Promise<Campaign | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let campaignData;
  try {
    campaignData = await Campaign.findByPk(campaignId);
  } catch (err) {
    throw new AppError("ERR_NO_CAMPAIGN", 404);
  }
  return campaignData;
};

export default ShowCampaignService;
