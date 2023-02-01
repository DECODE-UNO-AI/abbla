/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import { logger } from "../../utils/logger";
import CloneCampaignContactsService from "../CampaignContactService/CloneCampaignContactsService";
import CreateCampaignContactsService from "../CampaignContactService/CreateCampaignContactsService";

const cArquivoName = (url: string | undefined) => {
  if (!url) return "";
  const split = url.split("/");
  const name = split[split.length - 1];
  return name;
};
interface CampaignData {
  name: string;
  inicialDate: string;
  startNow?: string;
  mediaBeforeMessage?: string;
  columnName: string;
  delay?: string;
  sendTime: string;
  message1: string;
  message2?: string;
  message3?: string;
  message4?: string;
  message5?: string;
  mediaUrl?: string;
  mediaType?: string;
  userId: string;
  whatsappId: string;
}

interface Request {
  campaignData: CampaignData;
  medias?: Express.Multer.File[];
  campaignId: string | number;
}

const RepeatCampaignService = async ({
  campaignData,
  medias,
  campaignId
}: Request): Promise<Campaign> => {
  let mediaData: Express.Multer.File | undefined;
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

  const mediaBeforeOrder = campaignData.mediaBeforeMessage !== "false";

  let data: any = {
    ...campaignData,
    mediaUrl: cArquivoName(campaignData.mediaUrl),
    inicialDate: startDate,
    mediaBeforeMessage: mediaBeforeOrder,
    columnName: campaignData.columnName.trim(),
    delay: delayValue,
    status: "scheduled",
    sendTime: campaignData.sendTime.replace(",", "-")
  };
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
          } else {
            mediaData = media;
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
    if (mediaData) {
      data = {
        ...data,
        mediaUrl: mediaData?.filename,
        mediaType: mediaData?.mimetype.substr(
          0,
          mediaData.mimetype.indexOf("/")
        )
      };
    }
  } else if (campaignData.mediaUrl === "null") {
    data = {
      ...data,
      mediaUrl: "",
      mediaType: ""
    };
  }
  let campaignModel;
  try {
    campaignModel = await Campaign.create({
      name: data.name.trim(),
      inicialDate: startDate,
      sendTime: data.sendTime.replace(",", "-"),
      columnName: data.columnName.trim(),
      status: "scheduled",
      message1: data.message1,
      message2: data.message2,
      message3: data.message3,
      message4: data.message4,
      message5: data.message5,
      userId: data.userId,
      delay: delayValue,
      mediaBeforeMessage: mediaBeforeOrder,
      contactsCsv: data.contactsCsv,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      whatsappId: data.whatsappId
    });
  } catch (err) {
    logger.error(err);
    throw new AppError("INTERNAL_ERR", 500);
  }
  if (contacts) {
    await CreateCampaignContactsService(campaignModel);
  } else {
    await CloneCampaignContactsService(campaignModel, campaignId);
  }

  return campaignModel;
};

export default RepeatCampaignService;
