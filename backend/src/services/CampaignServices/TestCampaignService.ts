/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
import { join } from "path";
import { MessageMedia } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import { getWbot, Session } from "../../libs/wbot";
import WhatsappApi from "../../models/WhatsappApi";
import axios from "axios";
import path from "path";
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

const sendMessage = async (whatsapp: Session, number: string, message: string[], medias: Express.Multer.File[]) => {
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
    await (async () => {
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
      await setDelay((Math.floor(Math.random() * 3) + 3) * 1000);
    })();
  }
}

const sendApiMessage = async (
  message: string[],
  whatsapp: WhatsappApi,
  contactNumber: string,
  medias: Express.Multer.File[]
): Promise<void> => {
  // Verify if number is valid
  let number;
  try {
    const { data } = await axios.get(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/contacts/${contactNumber}`);
    if (data.exists) {
      number = data.exists.resultjid
    }
  } catch (err) {
    logger.error(err);
    throw new AppError("ERR_NUMBER_NOT_FOUND", 404);
  }

  if (!number) {
    throw new AppError("ERR_NUMBER_NOT_FOUND", 404);
  }
  // Message sending logic
  try {
    await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
      jid: number,
      type: "number",
      message: {
        text: "------------------------------------------------------- \n MENSAGEM DE TESTE \n ABBLA - CAMPANHA \n -------------------------------------------------------"
      },
      options: {}
    })
    for(let i = 0; i < message.length; i += 1) {
      await (async () => {
      if (message[i].startsWith("file-")) {
        const file = message[i].replace("file-", "")
        const ext = path.extname(file)
        const media = medias.find(
        file => file.originalname === message[i].replace("file-", "")
        );

        if([".mp4", ".mkv"].includes(ext)){
          await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
            jid: number,
            type: "number",
            message: {
              video: media?.buffer.toString("base64")
            },
            options: {},
            isBufferFiles: true
          })
        } else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
          await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
            jid: number,
            type: "number",
            message: {
              image : media?.buffer.toString("base64")
            },
            options: {},
            isBufferFiles: true
          })
        } else if ([".ogg", ".mp3", ".mpeg"].includes(ext)) {
          await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
            jid: number,
            type: "number",
            message: {
              audio : media?.buffer.toString("base64")
            },
            options: {},
            isBufferFiles: true
          })
        }
      } else {
        await axios.post(`${process.env.BAILEYS_API_HOST}/${whatsapp.sessionId}/messages/send`, {
          jid: number,
          type: "number",
          message: {
            text: message[i]
          },
          options: {}
        })
      }
      await setDelay((Math.floor(Math.random() * 3) + 3) * 1000);
      })();

    }

  } catch (err) {
    throw new AppError("INTERNAL_ERROR", 500);
  }
}

const TestCampaignService = async ({
  campaignData,
  medias
}: CampaignData): Promise<void> => {
  const { message, number, whatsappId } = campaignData;

  if(!whatsappId.startsWith("api-")) {
    try{
      const whatsapp = getWbot(+whatsappId);
      const whatsappState = await whatsapp.getState();
      if (!whatsapp || whatsappState !== "CONNECTED") {
        throw new AppError("ERR_WAPP_NOT_INITIALIZED", 400);
      }
      await sendMessage(whatsapp, number, message, medias)
      return
    } catch(err) {
      throw new AppError(err.message, 500);
    }
  }

  try {
    const apiCon = await WhatsappApi.findByPk(whatsappId.slice(4))
    if(!apiCon) {
      throw new AppError("ERR_WAPP_NOT_INITIALIZED", 400);
    }
    await sendApiMessage(message, apiCon, number, medias)
    return;
  } catch(err) {
    throw new AppError(err.message, 500);
  }

};

export default TestCampaignService;
