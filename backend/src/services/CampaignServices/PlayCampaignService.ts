import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

const PlayCampaignService = async (
  campaignId: string | number
): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }
  if (!["paused", "timeout"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANT_BE_PLAYED", 403);
  }

  const startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() + 1);
  await campaign.update({
    inicialDate: startDate
  });

  return campaign;
};

export default PlayCampaignService;
