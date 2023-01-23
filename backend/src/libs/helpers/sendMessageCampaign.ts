import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import GetCampaignContactsService from "../../services/CampaignContactService/GetCampaignContactsService";
import { logger } from "../../utils/logger";
import { reSheduleJob } from "../campaignQueue";

const sendMessageCampaign = async (campaign: Campaign): Promise<void> => {
  await campaign.update({ status: "processing" });

  const penddingContacts = await GetCampaignContactsService(
    campaign.id,
    "pending"
  );

  // getting wbot

  // const whatsapp = getWbot(+campaign.whatsappId);

  // if (!whatsapp) {
  //   // failed campaing because no wbot setted
  // }

  // get messages
  const messages = [campaign.message1];

  // get sending hours interval
  const sendTime = campaign.sendTime.split("-");

  if (campaign.message2 && campaign.message2 !== "") {
    messages.push(campaign.message2);
  }
  if (campaign.message3 && campaign.message3 !== "") {
    messages.push(campaign.message3);
  }
  if (campaign.message4 && campaign.message4 !== "") {
    messages.push(campaign.message4);
  }
  if (campaign.message5 && campaign.message5 !== "") {
    messages.push(campaign.message5);
  }

  // get delay interval
  const delay = campaign.delay.split("-");
  const range = delay.map(num => parseInt(num, 10));

  // interate over contatcs
  const sendMessage = async (
    contact: CampaignContact,
    index: number
  ): Promise<string> => {
    const { status } = await campaign.reload();
    if (status !== "processing") {
      return "break";
    }
    // verify if campaign is in time
    const currentDate = new Date();
    if (
      !(
        currentDate.getHours() >= +sendTime[0] &&
        currentDate.getHours() < +sendTime[1]
      )
    ) {
      await campaign.update({
        status: "timeout"
      });
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(+sendTime[0]);
      currentDate.setMinutes(0);
      reSheduleJob(campaign, currentDate);
      return "break";
    }

    // random delay and message
    const randomDelay = Math.floor(
      Math.random() * (range[1] - range[0] + 1) + range[0]
    );
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    setTimeout(async () => {
      // Message sending logic
      console.log(contact.number);
      // await campaign.update({ lastLineContact: i });
      if (index + 1 === penddingContacts.length) {
        await campaign.update({ status: "finished" });
      }
    }, randomDelay * 1000);
    return "continue";
  };

  for (let i = 0; i < penddingContacts.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const message = await sendMessage(penddingContacts[i], i);
    if (message === "break") {
      break;
    }
  }
};

export default sendMessageCampaign;
