import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

const PauseCampaignService = async (
  campaignId: string | number
): Promise<void> => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }
  if (!["processing", "timeout"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANT_BE_PAUSED", 403);
  }
  await campaign.update({
    status: "paused"
  });
};

export default PauseCampaignService;
