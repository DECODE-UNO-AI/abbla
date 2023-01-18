/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseISO, setHours, setMinutes } from "date-fns";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

import Campaign from "../../models/Campaign";

interface CampaignRequest {
  name: string;
  start: string;
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
  campaign: CampaignRequest;
  medias?: Express.Multer.File[];
}

const CreateCampaignService = async ({
  campaign,
  medias
}: Request): Promise<Campaign> => {
  let mediaData: Express.Multer.File | undefined;
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
          } else {
            mediaData = media;
          }
        } catch (err) {
          logger.error(err);
        }
      })
    );
  }

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACTS_FILE", 403);
  }
  const data: any = {
    name: campaign.name,
    start: setHours(setMinutes(parseISO(campaign.start), 0), 8),
    message1: campaign.message1,
    message2: campaign.message2,
    message3: campaign.message3,
    message4: campaign.message4,
    message5: campaign.message5,
    userId: campaign.userId,
    contacts: contacts?.filename,
    mediaUrl: mediaData?.filename,
    mediaType: mediaData?.mimetype.substr(0, mediaData.mimetype.indexOf("/")),
    whatsappId: campaign.whatsappId
  };
  const campaignData = await Campaign.create(data);

  return campaignData;
};

export default CreateCampaignService;
