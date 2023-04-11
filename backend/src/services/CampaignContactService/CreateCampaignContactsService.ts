/* eslint-disable no-continue */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from "path";
import csv from "csvtojson";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import ShowCampaignAllContactsList from "../CampaignContactsListService/ShowCampaignAllContactsList";

const csvFileToArray = async (csvPathFile: string): Promise<any> => {
  return csv({ delimiter: [","] }).fromFile(
    csvPathFile
  );
};

const CreateCampaignContactsService = async (
  campaign: Campaign
): Promise<void> => {

  let csvArray: [];
  let numberAllContacts = 0;

  if (campaign.contactsCsv) {
    const csvPathFile = resolve(
      __dirname,
      "../../../",
      "public",
      `${campaign.contactsCsv}`
    );
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
        continue;
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
          numberAllContacts += 1;
        } catch (err) {
          throw new AppError("ERR_NO_CONTACTS_FILE");
        }
      })();
    }
  } else if (campaign.contactsListId) {
    const { contacts } = await ShowCampaignAllContactsList(campaign.contactsListId, true)
    if (contacts.length === 0) {
      throw new AppError("ERR_NO_CONTACTS");
    }
    for (let i = 0; i < contacts.length; i += 1) {
      const contact = contacts[i];
      try {
        await CampaignContact.create({
          number: contact.number,
          status: "pending",
          campaignId: campaign.id,
          details: {
            name: contact.name,
            number: contact.number,
            email: contact.email
          }
        });
        numberAllContacts += 1;
      } catch (err) {
        throw new AppError("ERR_NO_CONTACTS_FILE");
      }
    }
  } else {
    throw new AppError("ERR_NO_CONTACTS_FILE");
  }


  await campaign.update({ contactsNumber: numberAllContacts });
};

export default CreateCampaignContactsService;
