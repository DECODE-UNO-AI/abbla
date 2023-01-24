import Campaign from "../../models/Campaign";

const DeleteCampaignService = async (
  campaignId: string | number
): Promise<void> => {
  await Campaign.destroy({
    where: { id: +campaignId }
  });
};

export default DeleteCampaignService;
