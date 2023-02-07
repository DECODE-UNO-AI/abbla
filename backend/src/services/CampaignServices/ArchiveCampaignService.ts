import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

const ArchiveCampaignService = async (
  campaignId: string | number
): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(+campaignId);

  if (!campaign) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }

  if (!["canceled", "finished", "failed"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANT_BE_ARCHIVED", 403);
  }

  await campaign.update({
    status: "archived"
  });
  await campaign.reload();

  return campaign;
};

export default ArchiveCampaignService;
