/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from "path";
import csv from "csvtojson";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";

const csvFileToArray = async (csvPathFile: string): Promise<any> => {
  return csv({ delimiter: [";", ".", ",", "-", "/", "|", "_"] }).fromFile(
    csvPathFile
  );
};

const CreateCampaignContactsService = async (
  campaign: Campaign
): Promise<void> => {
  const csvPathFile = resolve(
    __dirname,
    "../../../",
    "public",
    `${campaign.contactsCsv}`
  );
  let csvArray: [];
  try {
    csvArray = await csvFileToArray(csvPathFile);
  } catch (err) {
    logger.error("ERR_NO_CONTACTS_FILE");
    return;
  }

  for (let i = 0; i < csvArray.length; i += 1) {
    const contact = csvArray[i];
    let contactNumber: string = contact[campaign.columnName] || null;
    if (!contactNumber) {
      break;
    }
    if (!contactNumber.startsWith("55")) {
      contactNumber = `55${contactNumber}`;
    }
    await (async () => {
      try {
        await CampaignContact.create({
          number: contactNumber,
          status: "pending",
          campaignId: campaign.id,
          details: contact
        });
      } catch (err) {
        throw new AppError("ERR_NO_CONTACTS_FILE");
      }
    })();
  }
};

export default CreateCampaignContactsService;
