/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../../utils/logger";

import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";

const DeleteCampaignContactService = async (
  campaign: Campaign
): Promise<void> => {
  try {
    await CampaignContact.destroy({
      where: { campaignId: campaign.id }
    });
  } catch (err) {
    logger.error(err);
  }
};

export default DeleteCampaignContactService;
