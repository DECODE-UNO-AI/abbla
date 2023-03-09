import { Request, Response } from "express";
import { deleteSession, getWbot, removeWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { getIO } from "../libs/socket";
import ResetWhatsappSession from "../services/WhatsappService/ResetWhatsappSession";
import NotificateOnDisconnected from "../services/WbotServices/NotificateOnDisconnected";
import WhatsappApi from "../models/WhatsappApi";
import AppError from "../errors/AppError";
import axios from "axios";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { isQrcode } = req.body;

  if (isQrcode) {
    await deleteSession(whatsappId);
  }

  const { whatsapp } = await ResetWhatsappSession(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);
  const wbot = getWbot(whatsapp.id);

  // await wbot.logout() -> Method with bugs, does not provides a stable disconnection
  await wbot.destroy();
  removeWbot(whatsapp.id);

  const io = getIO();
  await whatsapp.update({
    status: "DISCONNECTED",
    session: "",
    qrcode: null,
    retries: 0
  });

  await NotificateOnDisconnected(whatsapp);

  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  return res.status(200).json({ message: "Session disconnected." });
};

const reconectApi = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.body;

  try {
    const whatsapp = await WhatsappApi.findByPk(id);

    if(!whatsapp) return
    await whatsapp.update({ status: "OPENING"})
    await axios.post(`${process.env.BAILEYS_API_HOST}/sessions/add`, { sessionId: whatsapp.sessionId })
    const io = getIO();
    io.emit("whatsappapi-update", {
      action: "UPDATE_SESSION",
      whatsapp: whatsapp
    });
    return res.status(200)
  } catch (e) {
    throw new AppError(e);
  }
}

const disconnectApi = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const whatsapp = await WhatsappApi.findByPk(id);
    if(!whatsapp) return
    await axios.delete(`${process.env.BAILEYS_API_HOST}/sessions/${whatsapp.sessionId}`)
  } catch(e) {
    throw new AppError(e);
  }
}


export default { store, remove, update, disconnectApi, reconectApi };
