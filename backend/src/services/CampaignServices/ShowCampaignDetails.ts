import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";

const ShowCampaignDetails = async (
  campaignId: string
): Promise<Campaign | Response | null> => {
  try {
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        {
          model: CampaignContact,
          as: "campaignContacts"
        }
      ]
    });
    return campaign;
  } catch (err) {
    throw new AppError(err);
  }
};

export default ShowCampaignDetails;
