/* eslint-disable @typescript-eslint/no-explicit-any */
import CampaignContact from "../../models/CampaignContact";

const GetCampaignContactsService = async (
  campaignId: string | number,
  status: string
): Promise<CampaignContact[]> => {
  const contacts = await CampaignContact.findAll({
    where: { campaignId, status }
  });

  return contacts;
};

export default GetCampaignContactsService;
