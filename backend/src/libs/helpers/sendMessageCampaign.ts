/* eslint-disable no-await-in-loop */
import { join } from "path";
import { MessageMedia } from "whatsapp-web.js";
import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import GetCampaignContactsService from "../../services/CampaignContactService/GetCampaignContactsService";
import { logger } from "../../utils/logger";
import { reSheduleJob } from "../campaignQueue";
import { getWbot, Session } from "../wbot";

const setDelay = async (delay: number) => {
  await new Promise(resolve => setTimeout(resolve, delay));
};

const sendMessage = async (
  contact: CampaignContact,
  message: string,
  wbot: Session,
  mediaFile: MessageMedia | null
): Promise<void> => {
  // Verify if number is valid
  let number;
  try {
    number = await wbot.getNumberId(`${contact.number}@c.us`);
  } catch (err) {
    contact.update({
      status: "failed"
    });
    logger.error(err);
  }
  if (!number) {
    contact.update({
      status: "invalid-number"
    });
    return;
  }
  // Message sending logic
  try {
    if (mediaFile) {
      // eslint-disable-next-line no-underscore-dangle
      await wbot.sendMessage(number._serialized, mediaFile, {
        sendAudioAsVoice: true,
        caption: message
      });
    } else {
      // eslint-disable-next-line prettier/prettier, no-underscore-dangle
      await wbot.sendMessage(number._serialized , message);
    }
    contact.update({
      status: "sent"
    });
  } catch (err) {
    contact.update({
      status: "failed"
    });
  }
};

const sendMessageCampaign = async (campaign: Campaign): Promise<void> => {
  await campaign.update({ status: "processing" });
  const penddingContacts = await GetCampaignContactsService(
    campaign.id,
    "pending"
  );

  // getting wbot
  let whatsapp;
  try {
    whatsapp = getWbot(+campaign.whatsappId);
    const whatsappState = await whatsapp.getState();
    if (!whatsapp || whatsappState !== "CONNECTED") {
      await campaign.update({
        status: "failed"
      });
      return;
    }
  } catch (err) {
    logger.error(err);
    await campaign.update({
      status: "failed"
    });
    return;
  }

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

    // getting media
    let mediaFile: MessageMedia | null = null;
    if (campaign.mediaUrl) {
      const fileName = campaign.mediaUrl.split("/")[4];
      const customPath = join(__dirname, "..", "..", "..", "public", fileName);
      mediaFile = MessageMedia.fromFilePath(customPath);
    }
    // replacing variables
    Object.keys(penddingContacts[i].details).forEach(key => {
      randomMessage = randomMessage.replace(
        `$${key}`,
        `${penddingContacts[i].details[key]}`
      );
    });
    await setDelay(randomDelay * 1000);
    await sendMessage(penddingContacts[i], randomMessage, whatsapp, mediaFile);
    if (i + 1 === penddingContacts.length) {
      try {
        await campaign.update({ status: "finished" });
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

export default sendMessageCampaign;
