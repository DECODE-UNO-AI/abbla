import AppError from "../../errors/AppError";
import { finishJob } from "../../libs/campaignQueue";
import Campaign from "../../models/Campaign";

const CancelCampaignService = async (
  campaignId: string | number
): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }
  finishJob(campaignId);

  await campaign.update({
    status: "canceled"
  });

  await campaign.reload();

  return campaign;
};

export default CancelCampaignService;
