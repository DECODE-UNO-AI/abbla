import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

const PlayCampaignService = async (
  campaignId: string | number
): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }
  if (campaign.status !== "paused") {
    throw new AppError("ERR_CAMPAIGN_CANT_BE_PLAYED", 403);
  }

  let startDate;
  const currentData = new Date();
  const scheduledDate = new Date(campaign.inicialDate);
  const diff = scheduledDate.getTime() - currentData.getTime();
  if (diff < 0) {
    startDate = Date.now() + 100; // 1000 * 10; // Set a correct delay to start whatsapp connections
  } else {
    startDate = scheduledDate;
  }
  await campaign.update({
    inicialDate: startDate
  });

  return campaign;
};

export default PlayCampaignService;
