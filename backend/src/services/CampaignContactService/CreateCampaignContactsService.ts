/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from "path";
import csv from "csvtojson";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";

const csvFileToArray = async (csvPathFile: string): Promise<any> => {
  return csv({ delimiter: [";", ".", ",", " ", "-", "/", "|", "_"] }).fromFile(
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
    logger.error("Invalid .csv file");
    return;
  }

  csvArray.forEach(async contact => {
    try {
      await CampaignContact.create({
        number: contact[campaign.columnName],
        status: "pending",
        campaignId: campaign.id
      });
    } catch (err) {
      throw new AppError("Invalid .cvs file");
    }
  });
};

export default CreateCampaignContactsService;
