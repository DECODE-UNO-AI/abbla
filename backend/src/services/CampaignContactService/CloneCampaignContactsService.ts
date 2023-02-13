/* eslint-disable no-loop-func */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";

const CloneCampaignContactsService = async (
  campaignModel: Campaign,
  campaignId: string | number
): Promise<void> => {
  const contacts = await CampaignContact.findAll({
    where: { campaignId: +campaignId }
  });

  if (contacts.length < 1) {
    throw new AppError("INTERNAL_ERR", 500);
  }

  let numberAllContacts = 0;
  for (let i = 0; i < contacts.length; i += 1) {
    const contact = contacts[i];
    let contactNumber: string = contact.details[campaignModel.columnName];
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
          campaignId: campaignModel.id,
          details: contact.details
        });
        numberAllContacts += 1;
      } catch (err) {
        throw new AppError("INTERNAL_ERR", 500);
      }
    })();
  }
  await campaignModel.update({ contactsNumber: numberAllContacts });
};

export default CloneCampaignContactsService;
