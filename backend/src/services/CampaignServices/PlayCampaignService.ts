import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

const PlayCampaignService = async (
  campaignId: string | number
): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }
  if (!["paused", "failed"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANT_BE_PLAYED", 403);
  }

  let startDate;
  const currentData = new Date();
  const scheduledDate = new Date(campaign.inicialDate);
  const diff = scheduledDate.getTime() - currentData.getTime();
  if (diff < 0) {
    startDate = Date.now() + 1000;
  } else {
    startDate = scheduledDate;
  }
  await campaign.update({
    status: "scheduled",
    inicialDate: startDate
  });

  await campaign.reload();
  return campaign;
};

export default PlayCampaignService;
