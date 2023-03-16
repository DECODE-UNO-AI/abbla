/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
// import { join } from "path";
import fs from "fs";
import path, { join } from "path";
import { Server } from "socket.io";
import { MessageMedia } from "whatsapp-web.js";
import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import GetCampaignContactsService from "../../services/CampaignContactService/GetCampaignContactsService";
import { logger } from "../../utils/logger";
import { reSheduleJob } from "../campaignQueue";
import { getIO } from "../socket";
import { getWbot, Session } from "../wbot";
import axios from "axios";
import WhatsappApi from "../../models/WhatsappApi";

const setDelay = async (delay: number) => {
  await new Promise(resolve => setTimeout(resolve, delay));
};

const sendMessage = async (
  contact: CampaignContact,
  message: string[],
  wbot: Session,
  io: Server,
  campaign: Campaign
): Promise<void> => {
  // Verify if number is valid
  let number;
  try {
    number = await wbot.getNumberId(`${contact.number}@c.us`);
  } catch (err) {
    await contact.update({
      status: "invalid-number",
    });
    await contact.reload()
    await campaign.increment("contactsFailed", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });
    logger.error(err);
    return
  }
  if (!number) {
    await contact.update({
      status: "invalid-number",
    });
    await contact.reload()
    await campaign.increment("contactsFailed", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });
    return;
  }
  // Message sending logic
  try {
    for(let i = 0; i < message.length; i += 1) {
      await (async () => {
      if (message[i].startsWith("file-")) {
          const messageMedia = MessageMedia.fromFilePath(
          join(
            __dirname,
            "..",
            "..",
            "..",
            "public",
            message[i].replace("file-", "")
          )
        );
        if (!messageMedia) return;
        await wbot.sendMessage(number._serialized, messageMedia, {
          sendAudioAsVoice: true,
          sendMediaAsDocument: false
        });
      } else {
        await wbot.sendMessage(number._serialized , message[i]);
      }
      await setDelay((Math.floor(Math.random() * 3) + 3) * 1000);
      })();

    }
    await contact.update({
      status: "sent",
      messageSent: JSON.stringify(message)
    });
    await contact.reload()
    await campaign.increment("contactsSent", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });

  } catch (err) {
    await contact.update({ status: "failed"});
    await contact.reload()
    await campaign.increment("contactsFailed", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });
  }
};

const sendApiMessage = async (
  contact: CampaignContact,
  message: string[],
  whatsapp: WhatsappApi,
  io: Server,
  campaign: Campaign
): Promise<void> => {
  // Verify if number is valid
  let number;
  try {
    const { data } = await axios.get(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/contacts/${contact.number.slice(2)}`);
    if (data.exists) {
      number = data.exists.resultjid

    }
  } catch (err) {

    await contact.update({
      status: "invalid-number",
    });
    await contact.reload()
    await campaign.increment("contactsFailed", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });
    logger.error(err);
    return
  }

  if (!number) {

    await contact.update({
      status: "invalid-number",
    });
    await contact.reload()
    await campaign.increment("contactsFailed", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });
    return;
  }
  // Message sending logic
  try {
    for(let i = 0; i < message.length; i += 1) {
      await (async () => {
      if (message[i].startsWith("file-")) {
        const file = message[i].replace("file-", "")
        const ext = path.extname(file)

        if([".mp4", ".mkv"].includes(ext)){
          await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
            jid: number,
            type: "number",
            message: {
              video: { url: `${process.env.BACKEND_URL}/public/${file}`}
            },
            options: {}
          })
        } else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
          await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
            jid: number,
            type: "number",
            message: {
              image : { url: `${process.env.BACKEND_URL}/public/${file}`}
            },
            options: {}
          })
        } else if ([".ogg", ".mp3", ".mpeg"].includes(ext)) {
          await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
            jid: number,
            type: "number",
            message: {
              audio : { url: `${process.env.BACKEND_URL}/public/${file}`}
            },
            options: {}
          })
        }
      } else {
        await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
          jid: number,
          type: "number",
          message: {
            text: message[i]
          },
          options: {}
        })
      }
      await setDelay((Math.floor(Math.random() * 3) + 3) * 1000);
      })();

    }
    await contact.update({
      status: "sent",
      messageSent: JSON.stringify(message)
    });
    await contact.reload()
    await campaign.increment("contactsSent", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });

  } catch (err) {
    await contact.update({ status: "failed"});
    await contact.reload()
    await campaign.increment("contactsFailed", { by: 1 })
    await campaign.reload()
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    io.emit(`campaign-${campaign.id}`, {
      action: "update",
      contact,
      campaign
    });
  }
}

const sendMessageCampaign = async (campaign: Campaign): Promise<void> => {
  await campaign.update({ status: "processing" });
  await campaign.reload();
  const io = getIO();
  io.emit("campaigns", {
    action: "update",
    campaign
  });
  const penddingContacts = await GetCampaignContactsService(
    campaign.id,
    "pending"
  );

  // getting wbot
  let whatsapp: WhatsappApi | Session;
  if (!campaign.whatsappApiId) {
    try {
      whatsapp = getWbot(+campaign.whatsappId);
      const whatsappState = await whatsapp.getState();
      if (!whatsapp || whatsappState !== "CONNECTED") {
        await campaign.update({
          status: "failed"
        });
        await campaign.reload();
        io.emit("campaigns", {
          action: "update",
          campaign
        });
        return;
      }
    } catch (err) {
      logger.error(err);
      await campaign.update({
        status: "failed"
      });
      await campaign.reload();
      io.emit("campaigns", {
        action: "update",
        campaign
      });
      return;
    }
  } else {
    try {
      const whatsappdata = await WhatsappApi.findByPk(campaign.whatsappApiId)
      if (!whatsappdata ) {
        await campaign.update({
          status: "failed"
        });
        await campaign.reload();
        io.emit("campaigns", {
          action: "update",
          campaign
        });
        return;
      }
      whatsapp = whatsappdata;
    } catch (err) {
      logger.error(err);
      await campaign.update({
        status: "failed"
      });
      await campaign.reload();
      io.emit("campaigns", {
        action: "update",
        campaign
      });
      return;
    }
  }


  // get messages
  const messages: Array<string[]> = [];

  // get sending hours interval
  const { sendTime } = campaign;

  if (campaign.message1 && campaign.message1.length > 0) {
    messages.push(campaign.message1);
  }
  if (campaign.message2 && campaign.message2.length > 0) {
    messages.push(campaign.message2);
  }
  if (campaign.message3 && campaign.message3.length > 0) {
    messages.push(campaign.message3);
  }
  if (campaign.message4 && campaign.message4.length > 0) {
    messages.push(campaign.message4);
  }
  if (campaign.message5 && campaign.message5.length > 0) {
    messages.push(campaign.message5);
  }

  if (messages.length === 0) {
    await campaign.update({
      status: "failed"
    });
    await campaign.reload();
    io.emit("campaigns", {
      action: "update",
      campaign
    });
    return;
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
      if (currentDate.getHours() < +sendTime[0]) {
        currentDate.setHours(+sendTime[0]);
        currentDate.setMinutes(0);
      } else {
        currentDate.setHours(currentDate.getHours() + 24);
        currentDate.setHours(+sendTime[0])
        currentDate.setMinutes(0);
      }
      reSheduleJob(campaign, currentDate);
      await campaign.update({
        status: "timeout",
      });
      await campaign.reload();
      io.emit("campaigns", {
        action: "update",
        campaign
      });
      break;
    }
    // random delay and message
    const randomDelay = Math.floor(
      Math.random() * (range[1] - range[0] + 1) + range[0]
    );
    let randomMessages = messages[Math.floor(Math.random() * messages.length)];


    // replacing variables
    Object.keys(penddingContacts[i].details).forEach(key => {
      randomMessages = randomMessages.map((message: string) => {
        if (message.startsWith("file-")) {
          return message
        }
        return message.replace(
          `$${key}`,
          `${penddingContacts[i].details[key]}`
        );
      })
    });
    await setDelay(randomDelay * 1000);
    if (!(whatsapp instanceof WhatsappApi)){
      await sendMessage(penddingContacts[i], randomMessages, whatsapp, io, campaign);
    } else {
      await sendApiMessage(penddingContacts[i], randomMessages, whatsapp, io, campaign);
    }
    if (i + 1 === penddingContacts.length) {
      try {
        await campaign.update({ status: "finished" });
        await campaign.reload();
        io.emit("campaigns", {
          action: "update",
          campaign
        });
      } catch (err) {
        logger.error(err);
      }
    }
  }
};

export default sendMessageCampaign;
