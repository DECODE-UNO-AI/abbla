import Campaign from "../../models/Campaign";

const ListCampaignService = async (): Promise<Campaign[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const campaignData = await Campaign.findAll();

  return campaignData;
};

export default ListCampaignService;
