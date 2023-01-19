import { resolve } from "path";
import csv from "csvtojson";
import Campaign from "../../models/Campaign";
import { logger } from "../../utils/logger";
import { getWbot } from "../wbot";

interface IContact {
  name: string;
  number: string;
}

const csvFileToArray = async (csvPathFile: string): Promise<IContact[]> => {
  return csv({ delimiter: [";", ".", ",", " ", "-"] }).fromFile(csvPathFile);
};

const sendMessageCampaign = async (campaign: Campaign): Promise<void> => {
  // await campaign.update({ status: "processing" });

  // await campaign.reload();

  const csvPathFile = resolve(
    __dirname,
    "../../../",
    "public",
    `${campaign.contacts}`
  );
  let csvArray: Array<IContact>;
  try {
    csvArray = await csvFileToArray(csvPathFile);
  } catch (err) {
    logger.error("Invalid .csv file");
    return;
  }

  // getting wbot

  // const whatsapp = getWbot(+campaign.whatsappId);

  // if (!whatsapp) {
  //   // failed campaing because no wbot setted
  // }

  // get messages
  const messages = [campaign.message1];

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

  // interate over contacts array
  csvArray.forEach((contact, index) => {
    const randomDelay = Math.floor(
      Math.random() * (range[1] - range[0] + 1) + range[0]
    );
    const randomMessage = Math.floor(Math.random() * messages.length);

    setTimeout(async () => {
      // checking if campaign is paused
      const { status } = await campaign.reload();
      if (status !== "processing") {
        return;
      }
      await campaign.update({ lastLineContact: index });
      console.log(contact);
    }, randomDelay * 1000); // add a delay to campaing model
  });
};

export default sendMessageCampaign;
