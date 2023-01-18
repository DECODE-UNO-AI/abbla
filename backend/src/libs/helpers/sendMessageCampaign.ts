import Campaign from "../../models/Campaign";

const sendMessageCampaign = async (campaign: Campaign): Promise<any> => {
  console.log("função feita");
  await campaign.update({ status: "processing" });
};

export default sendMessageCampaign;
