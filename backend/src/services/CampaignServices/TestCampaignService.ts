/* eslint-disable no-underscore-dangle */
import { join } from "path";
import { MessageMedia } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";

interface CampaignData {
  campaignData: {
    mediaUrl?: string;
    mediaBeforeMessage?: string;
    message1: string;
    number: string;
    whatsappId: string;
  };
  mediaFile: Express.Multer.File | null;
}

const TestCampaignService = async ({
  campaignData,
  mediaFile
}: CampaignData): Promise<void> => {
  const { message1, mediaBeforeMessage, number } = campaignData;

  const whatsapp = getWbot(+campaignData.whatsappId);

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
  } catch (err) {
    throw new AppError("ERR_NUMBER_NOT_FOUND", 404);
  }
  if (!whatsNumber) {
    throw new AppError("ERR_NUMBER_NOT_FOUND", 404);
  }

  // getting media
  let file = null;
  if (mediaFile) {
    file = new MessageMedia(
      mediaFile.mimetype,
      mediaFile.buffer.toString("base64")
    );
  } else if (campaignData.mediaUrl) {
    const fileName = campaignData.mediaUrl.split("/")[4];
    const customPath = join(__dirname, "..", "..", "..", "public", fileName);
    file = MessageMedia.fromFilePath(customPath);
  }
  try {
    if (file) {
      if (mediaBeforeMessage) {
        await whatsapp.sendMessage(whatsNumber._serialized, "Mensagem teste");
        await whatsapp.sendMessage(whatsNumber._serialized, file, {
          sendAudioAsVoice: true,
          sendMediaAsDocument: false
        });
        await whatsapp.sendMessage(whatsNumber._serialized, message1);
      } else {
        await whatsapp.sendMessage(whatsNumber._serialized, "Mensagem teste");
        await whatsapp.sendMessage(whatsNumber._serialized, message1);
        await whatsapp.sendMessage(whatsNumber._serialized, file, {
          sendAudioAsVoice: true,
          sendMediaAsDocument: false
        });
      }
    } else {
      await whatsapp.sendMessage(whatsNumber._serialized, "Mensagem teste");
      await whatsapp.sendMessage(whatsNumber._serialized, message1);
    }
  } catch (err) {
    console.log(err);
    throw new AppError("INTERNAL_ERROR", 500);
  }
};

export default TestCampaignService;
