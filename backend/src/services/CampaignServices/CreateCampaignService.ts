/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

import Campaign from "../../models/Campaign";

interface CampaignRequest {
  name: string;
  inicialDate: string;
  startNow?: string;
  columnName: string;
  delay?: string;
  sendTime: string[];
  message1?: string[];
  message2?: string[];
  message3?: string[];
  message4?: string[];
  message5?: string[];
  userId: string;
  whatsappId: string;
}

interface Request {
  campaign: CampaignRequest;
  medias?: Express.Multer.File[];
}

const CreateCampaignService = async ({
  campaign,
  medias
}: Request): Promise<Campaign> => {
  let contacts: Express.Multer.File | undefined;
  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        try {
          if (!media.filename) {
            const ext = media.mimetype.split("/")[1].split(";")[0];
            media.filename = `${new Date().getTime()}.${ext}`;
          }
          if (media.mimetype === "text/csv") {
            contacts = media;
          }
        } catch (err) {
          logger.error(err);
        }
      })
    );
  }

  const delayValue =
    campaign.delay === "15"
      ? "120-240"
      : campaign.delay === "30"
      ? "60-120"
      : campaign.delay === "60"
      ? "30-60"
      : campaign.delay === "120"
      ? "15-30"
      : campaign.delay === "240"
      ? "10-15"
      : null;

  let startDate;
  if (campaign.startNow !== "false") {
    startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() + 1);
  } else {
    startDate = new Date(campaign.inicialDate);
  }
  const currentDate = new Date();
  if (startDate.getTime() - currentDate.getTime() < 0) {
    throw new AppError("ERR_INVALID_DATE", 403);
  }

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACTS_FILE", 403);
  }

  const data: any = {
    name: campaign.name.trim(),
    inicialDate: startDate,
    sendTime: campaign.sendTime,
    columnName: campaign.columnName.trim(),
    status: "scheduled",
    message1: campaign.message1,
    message2: campaign.message2,
    message3: campaign.message3,
    message4: campaign.message4,
    message5: campaign.message5,
    userId: campaign.userId,
    delay: delayValue,
    contactsCsv: contacts?.filename,
    whatsappId: campaign.whatsappId
  };
  const campaignData = await Campaign.create(data);

  return campaignData;
};

export default CreateCampaignService;
