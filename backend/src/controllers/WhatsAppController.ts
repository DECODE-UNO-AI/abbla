import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { createSession, deleteSession } from "../libs/wbot-api";
import { removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import AppError from "../errors/AppError";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import ListSupervisorWhatsAppsService from "../services/WhatsappService/ListSupervisorWhatsAppsService";
import User from "../models/User";
import Departament from "../models/Departament";
import CreateWhatsappApiService from "../services/WhasappApiService/CreateWhastappApiService";
import ShowWhatsappApisService from "../services/WhasappApiService/ShowWhatsappApisService";
import ShowWhatsappApiService from "../services/WhasappApiService/ShowWhatsappApiService";

interface WhatsappData {
  name: string;
  queueIds: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile === "admin") {
    const whatsapps = await ListWhatsAppsService();
    return res.status(200).json(whatsapps);
  }

  const currentUser = await User.findByPk(user.id, {
    include: [
      {
        model: Departament,
        as: "departaments"
      }
    ]
  });

  const departaments = currentUser?.departaments.map(dep => dep.id);
  const whatsapps = await ListSupervisorWhatsAppsService(departaments);

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const WhatsApps = await ListWhatsAppsService();

  if (WhatsApps.length >= Number(process.env.CONNECTIONS_LIMIT)) {
    throw new AppError("ERR_CONNECTION_CREATION_COUNT", 403);
  }

  const {
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds
  }: WhatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    farewellMessage,
    queueIds
  });

  StartWhatsAppSession(whatsapp);

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const storeapi = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name } = req.body;

  try {
    const whatsapp = await CreateWhatsappApiService(name);
    createSession({ whatsapp });
    return res.status(200).json({ whatsapp });
  } catch (err) {
    throw new AppError(err);
  }


};

export const showApis = async (
  req: Request,
  res: Response
): Promise<Response> => {

  try {
    const whatsapps = await ShowWhatsappApisService();
    return res.status(200).json({ whatsapps });
  } catch (err) {
    throw new AppError(err);
  }

};

export const showApi = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { apiId } = req.params

  try {
    const whatsapp = await ShowWhatsappApiService(apiId);
    return res.status(200).json(whatsapp);
  } catch (err) {
    throw new AppError(err);
  }

};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const whatsapp = await ShowWhatsAppService(whatsappId);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId
  });

  const io = getIO();
  io.emit("whatsapp", {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit("whatsapp", {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  await DeleteWhatsAppService(whatsappId);
  removeWbot(+whatsappId);

  const io = getIO();
  io.emit("whatsapp", {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};
