/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import { logger } from "../../utils/logger";
import CreateCampaignContactsService from "../CampaignContactService/CreateCampaignContactsService";
import DeleteCampaignContactService from "../CampaignContactService/DeleteCampaignContactService";

interface CampaignData {
  name: string;
  inicialDate: string;
  startNow?: string;
  columnName: string;
  delay?: string;
  sendTime: string[];
  message1: string[];
  message2?: string[];
  message3?: string[];
  message4?: string[];
  message5?: string[];
  userId: string;
  whatsappId: string | null;
}

interface Request {
  campaignData: CampaignData;
  medias?: Express.Multer.File[];
  campaignId: string | number;
}

const UpdateCampaignService = async ({
  campaignData,
  medias,
  campaignId
}: Request): Promise<Campaign> => {
  let contacts: Express.Multer.File | undefined;

  let startDate;
  if (campaignData.startNow !== "false") {
    startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() + 1);
  } else {
    startDate = new Date(campaignData.inicialDate);
  }
  const currentDate = new Date();
  if (startDate.getTime() - currentDate.getTime() < 0) {
    throw new AppError("ERR_INVALID_DATE", 403);
  }

  const delayValue =
    campaignData.delay === "15"
      ? "120-240"
      : campaignData.delay === "30"
      ? "60-120"
      : campaignData.delay === "60"
      ? "30-60"
      : campaignData.delay === "120"
      ? "15-30"
      : campaignData.delay === "240"
      ? "10-15"
      : null;

  let data: any = {
    ...campaignData,
    inicialDate: startDate,
    columnName: campaignData.columnName.trim(),
    delay: delayValue,
    status: "scheduled",
    sendTime: campaignData.sendTime
  };

  const campaignModel = await Campaign.findOne({
    where: { id: campaignId }
  });

  if (!campaignModel) {
    throw new AppError("ERR_CAMPAIGN_NOT_FOUND", 404);
  }

  if (
    ["paused", "timeout", "processing", "finished"].includes(
      campaignModel.status
    )
  ) {
    throw new AppError(
      "ERR_NO_UPDATE_CAMPAIGN_NOT_IN_CANCELED_PROCESSING",
      404
    );
  }

  if (medias && Array.isArray(medias) && medias.length) {
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
    if (contacts) {
      data = {
        ...data,
        contactsCsv: contacts.filename
      };
    }
  }

  if (!campaignModel) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await campaignModel.update(data);

  await campaignModel.reload();

  if (contacts) {
    await DeleteCampaignContactService(campaignModel);
    await CreateCampaignContactsService(campaignModel);
  }

  return campaignModel;
};

export default UpdateCampaignService;
