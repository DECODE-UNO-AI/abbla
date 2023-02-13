/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
import { join } from "path";
import { MessageMedia } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

interface CampaignData {
  campaignData: {
    message: string[];
    number: string;
    whatsappId: string;
  };
  medias: Express.Multer.File[];
}

const setDelay = async (delay: number) => {
  await new Promise(resolve => setTimeout(resolve, delay));
};

const TestCampaignService = async ({
  campaignData,
  medias
}: CampaignData): Promise<void> => {
  const { message, number, whatsappId } = campaignData;
  const whatsapp = getWbot(+whatsappId);
  const whatsappState = await whatsapp.getState();
  if (!whatsapp || whatsappState !== "CONNECTED") {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED", 400);
  }

  let whatsNumber;
  let contactNumber: string = number;
  if (!contactNumber.startsWith("55")) {
    contactNumber = `55${contactNumber}`;
  }

  try {
    whatsNumber = await whatsapp.getNumberId(`${contactNumber}@c.us`);
    if (!whatsNumber) {
      throw new AppError("ERR_NUMBER_NOT_FOUND", 404);
    }
  } catch (err) {
    throw new AppError("ERR_NUMBER_NOT_FOUND", 404);
  }
  if (!whatsNumber) {
    throw new AppError("ERR_NUMBER_NOT_FOUND", 404);
  }

  try {
    await whatsapp.sendMessage(
      whatsNumber._serialized,
      "------------------------------------------------------- \n MENSAGEM DE TESTE \n ABBLA - CAMPANHA \n -------------------------------------------------------"
    );
  } catch {
    throw new AppError("INTERNAL_ERROR", 500);
  }
  for (let i = 0; i < message.length; i += 1) {
    const currentMessage = message[i];
    try {
      if (currentMessage.startsWith("file-")) {
        let messageMedia;
        const media = medias.find(
          file => file.originalname === currentMessage.replace("file-", "")
        );
        if (media) {
          messageMedia = new MessageMedia(
            media.mimetype,
            media.buffer.toString("base64")
          );
        } else {
          messageMedia = MessageMedia.fromFilePath(
            join(
              __dirname,
              "..",
              "..",
              "..",
              "public",
              currentMessage.replace("file-", "")
            )
          );
        }
        if (!messageMedia) return;
        await whatsapp.sendMessage(whatsNumber._serialized, messageMedia, {
          sendAudioAsVoice: true,
          sendMediaAsDocument: false
        });
      } else {
        await whatsapp.sendMessage(whatsNumber._serialized, currentMessage);
      }
    } catch (err) {
      logger.error(err);
      throw new AppError("INTERNAL_ERROR", 500);
    }
    await setDelay(1000);
  }
};

export default TestCampaignService;
