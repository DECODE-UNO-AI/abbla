import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

const DeleteCampaignService = async (
  campaignId: string | number
): Promise<void> => {
  const campaignModal = await Campaign.findByPk(campaignId);

  if (!campaignModal) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }
  campaignModal.destroy();
};

export default DeleteCampaignService;
