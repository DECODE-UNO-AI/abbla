import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateCampaignService from "../services/CampaignServices/CreateCampaignService";
import ListCampaignService from "../services/CampaignServices/ListCampaignService";
import CreateCampaignContactsService from "../services/CampaignContactService/CreateCampaignContactsService";
import UpdateCampaignService from "../services/CampaignServices/UpdateCampaignService";
import ShowCampaignService from "../services/CampaignServices/ShowCampaignService";
import DeleteCampaignService from "../services/CampaignServices/DeleteCampaignService";
import CancelCampaignService from "../services/CampaignServices/CancelCampaignService";
import PauseCampaignService from "../services/CampaignServices/PauseCampaignService";
import PlayCampaignService from "../services/CampaignServices/PlayCampaignService";
import { finishJob, startJob } from "../libs/campaignQueue";
import { logger } from "../utils/logger";
import ShowCampaignDetails from "../services/CampaignServices/ShowCampaignDetails";
import { getIO } from "../libs/socket";
import TestCampaignService from "../services/CampaignServices/TestCampaignService";
import ArchiveCampaignService from "../services/CampaignServices/ArchiveCampaignService";
import RepeatCampaignService from "../services/CampaignServices/RepeatCampaignService";

interface CampaignData {
  name: string;
  inicialDate: string;
  startNow?: string;
  columnName: string;
  mediaBeforeMessage?: string;
  sendTime: string;
  delay?: string;
  message1: string;
  message2?: string;
  message3?: string;
  message4?: string;
  message5?: string;
  contacts: string;
  mediaUrl: string;
  userId: string;
  whatsappId: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id, profile } = req.user;
  const medias = req.files as Express.Multer.File[];
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const campaign: CampaignData = {
    ...req.body,
    userId: id
  };
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    inicialDate: Yup.string().required(),
    columnName: Yup.string().required(),
    sendTime: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string(),
    message3: Yup.string(),
    message4: Yup.string(),
    message5: Yup.string(),
    userId: Yup.string().required(),
    whatsappId: Yup.string().required()
  });

  try {
    await schema.validate(campaign);
  } catch (error) {
    throw new AppError(error.message);
  }

  const newCampaign = await CreateCampaignService({
    campaign,
    medias
  });

  // Creating contacts
  try {
    await CreateCampaignContactsService(newCampaign);
  } catch (err) {
    throw new AppError("ERR_NO_CONTACTS_FILE");
  }
  await newCampaign.reload();
  startJob(newCampaign);

  const io = getIO();
  io.emit("campaigns", {
    action: "create",
    campaign: newCampaign
  });
  return res.status(200).json(newCampaign);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { profile } = req.user;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const campaigns = await ListCampaignService();
  return res.status(200).json(campaigns);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { profile } = req.user;
  const { campaignId } = req.params;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const campaign = await ShowCampaignService(campaignId);
  return res.status(200).json(campaign);
};

export const showCampaignDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { profile } = req.user;
  const { campaignId } = req.params;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const campaign = await ShowCampaignDetails(campaignId);

  return res.status(200).json(campaign);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id, profile } = req.user;
  const medias = req.files as Express.Multer.File[];

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const campaignData: CampaignData = {
    ...req.body,
    userId: id
  };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    inicialDate: Yup.string().required(),
    columnName: Yup.string().required(),
    sendTime: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string(),
    message3: Yup.string(),
    message4: Yup.string(),
    message5: Yup.string(),
    userId: Yup.string().required(),
    whatsappId: Yup.string().required()
  });

  try {
    await schema.validate(campaignData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { campaignId } = req.params;
  const campaignObj = await UpdateCampaignService({
    campaignData,
    medias,
    campaignId
  });
  await campaignObj.reload();

  if (campaignObj.status === "scheduled") {
    finishJob(campaignObj.id);
    startJob(campaignObj);
  }
  const io = getIO();
  io.emit("campaigns", {
    action: "update",
    campaign: campaignObj
  });
  return res.status(200).json(campaignObj);
};

export const testCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { profile } = req.user;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const schema = Yup.object().shape({
    number: Yup.string().required(),
    message1: Yup.string().required(),
    whatsappId: Yup.string().required(),
    mediaBeforeMessage: Yup.string().required()
  });

  const campaignData: {
    mediaUrl?: string;
    mediaBeforeMessage?: string;
    message1: string;
    number: string;
    whatsappId: string;
  } = req.body;
  const mediaFile = req.file || null;

  try {
    await schema.validate(campaignData);
  } catch (error) {
    throw new AppError(error.message);
  }

  await TestCampaignService({ campaignData, mediaFile });

  return res.status(200).json({ message: "message sent" });
};

export const cancelCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  try {
    const campaign = await CancelCampaignService(campaignId);
    const io = getIO();
    io.emit("campaigns", {
      action: "update",
      campaign
    });
  } catch (err) {
    throw new AppError("ERR_INTERNAL_ERROR", 500);
  }

  return res.status(200).json({ message: "Campaign canceled" });
};

export const pauseCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  try {
    const campaign = await PauseCampaignService(campaignId);
    const io = getIO();
    finishJob(campaignId);
    io.emit("campaigns", {
      action: "update",
      campaign
    });
  } catch (err) {
    throw new AppError("ERR_INTERNAL_ERROR", 500);
  }

  return res.status(200).json({ message: "Campaign paused" });
};

export const playCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  try {
    const campaign = await PlayCampaignService(campaignId);
    const io = getIO();
    startJob(campaign);
    io.emit("campaigns", {
      action: "update",
      campaign
    });
  } catch (err) {
    throw new AppError("ERR_INTERNAL_ERROR", 500);
  }

  return res.status(200).json({ message: "Campaign Restarted" });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "super-admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  try {
    await DeleteCampaignService(campaignId);
    finishJob(campaignId);
    const io = getIO();
    io.emit("campaigns", {
      action: "delete",
      campaignId
    });
  } catch (err) {
    logger.error(err);
    throw new AppError("ERR_INTERNAL", 500);
  }
  return res.status(200).json({ message: "Campaign deleted" });
};

export const archiveCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  try {
    const campaign = await ArchiveCampaignService(campaignId);
    const io = getIO();
    io.emit("campaigns", {
      action: "update",
      campaign
    });
  } catch (err) {
    throw new AppError("ERR_INTERNAL_ERROR", 500);
  }

  return res.status(200).json({ message: "Campaign archived" });
};

export const repeatCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id, profile } = req.user;
  const medias = req.files as Express.Multer.File[];
  const { campaignId } = req.params;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const campaignData: CampaignData = {
    ...req.body,
    userId: id
  };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    inicialDate: Yup.string().required(),
    columnName: Yup.string().required(),
    sendTime: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string(),
    message3: Yup.string(),
    message4: Yup.string(),
    message5: Yup.string(),
    userId: Yup.string().required(),
    whatsappId: Yup.string().required()
  });

  try {
    await schema.validate(campaignData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const campaign = await RepeatCampaignService({
    campaignData,
    medias,
    campaignId
  });
  await campaign.reload();
  startJob(campaign);
  const io = getIO();
  io.emit("campaigns", {
    action: "update",
    campaign
  });
  return res.status(200).json(campaign);
};
