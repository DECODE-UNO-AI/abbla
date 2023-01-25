/* eslint-disable no-await-in-loop */
import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import GetCampaignContactsService from "../../services/CampaignContactService/GetCampaignContactsService";
// import { logger } from "../../utils/logger";
import { reSheduleJob } from "../campaignQueue";

const setDelay = async (delay: number) => {
  await new Promise(resolve => setTimeout(resolve, delay));
};

const sendMessage = async (
  contact: CampaignContact,
  message: string
): Promise<void> => {
  // Message sending logic
  console.log(message);
  // await campaign.update({ lastLineContact: i });
};

const sendMessageCampaign = async (campaign: Campaign): Promise<void> => {
  await campaign.update({ status: "processing" });
  console.log("starting job");
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
  for (let i = 0; i < penddingContacts.length; i += 1) {
    const { status } = await campaign.reload();
    if (status !== "processing") {
      break;
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
      break;
    }
    // random delay and message
    const randomDelay = Math.floor(
      Math.random() * (range[1] - range[0] + 1) + range[0]
    );
    let randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // replacing variables
    Object.keys(penddingContacts[1].details).forEach(key => {
      randomMessage = randomMessage.replace(
        `$${key}`,
        `${penddingContacts[i].details[key]}`
      );
    });
    await setDelay(randomDelay * 1000);
    await sendMessage(penddingContacts[i], randomMessage);
    if (i + 1 === penddingContacts.length) {
      await campaign.update({ status: "finished" });
    }
  }
};

export default sendMessageCampaign;
