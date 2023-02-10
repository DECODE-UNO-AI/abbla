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
  sendTime: string[];
  delay?: string;
  message1: string[];
  message2?: string[];
  message3?: string[];
  message4?: string[];
  message5?: string[];
  contactsCsv: string;
  userId: string;
  whatsappId: string;
}

type IndexQuery = {
  searchParam: string;
  filterOptions: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id, profile } = req.user;
  const medias = req.files as Express.Multer.File[];
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  let campaign: CampaignData = {
    ...req.body,
    message1: req.body.message1 ? JSON.parse(req.body.message1) : [],
    message2: req.body.message2 ? JSON.parse(req.body.message2) : [],
    message3: req.body.message3 ? JSON.parse(req.body.message3) : [],
    message4: req.body.message4 ? JSON.parse(req.body.message4) : [],
    message5: req.body.message5 ? JSON.parse(req.body.message5) : [],
    sendTime: req.body.sendTime ? JSON.parse(req.body.sendTime) : [],
    userId: id
  };

  medias.forEach(file => {
    if (file.mimetype === "text/csv") return;
    const message1 = campaign.message1?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message2 = campaign.message2?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message3 = campaign.message3?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message4 = campaign.message4?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message5 = campaign.message5?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });

    campaign = {
      ...campaign,
      message1,
      message2,
      message3,
      message4,
      message5
    };
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    inicialDate: Yup.string().required(),
    columnName: Yup.string().required(),
    sendTime: Yup.array().required(),
    message1: Yup.array(),
    message2: Yup.array(),
    message3: Yup.array(),
    message4: Yup.array(),
    message5: Yup.array(),
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
  const { searchParam, filterOptions } = req.query as IndexQuery;
  const filterData: {
    status?: string[];
    conn?: number[];
  } = JSON.parse(filterOptions);
  const campaigns = await ListCampaignService(searchParam, filterData);
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

  let campaign: CampaignData = {
    ...req.body,
    message1: req.body.message1 ? JSON.parse(req.body.message1) : [],
    message2: req.body.message2 ? JSON.parse(req.body.message2) : [],
    message3: req.body.message3 ? JSON.parse(req.body.message3) : [],
    message4: req.body.message4 ? JSON.parse(req.body.message4) : [],
    message5: req.body.message5 ? JSON.parse(req.body.message5) : [],
    sendTime: req.body.sendTime ? JSON.parse(req.body.sendTime) : [],
    userId: id
  };

  medias.forEach(file => {
    if (file.mimetype === "text/csv") return;
    const message1 = campaign.message1?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message2 = campaign.message2?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message3 = campaign.message3?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message4 = campaign.message4?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message5 = campaign.message5?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });

    campaign = {
      ...campaign,
      message1,
      message2,
      message3,
      message4,
      message5
    };
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    inicialDate: Yup.string().required(),
    columnName: Yup.string().required(),
    sendTime: Yup.array().required(),
    message1: Yup.array(),
    message2: Yup.array(),
    message3: Yup.array(),
    message4: Yup.array(),
    message5: Yup.array(),
    userId: Yup.string().required(),
    whatsappId: Yup.string().required()
  });

  try {
    await schema.validate(campaign);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { campaignId } = req.params;
  const campaignObj = await UpdateCampaignService({
    campaignData: campaign,
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
    message1: string[];
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
  const { campaignId } = req.params;
  const medias = req.files as Express.Multer.File[];
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  let campaignData: CampaignData = {
    ...req.body,
    message1: req.body.message1 ? JSON.parse(req.body.message1) : [],
    message2: req.body.message2 ? JSON.parse(req.body.message2) : [],
    message3: req.body.message3 ? JSON.parse(req.body.message3) : [],
    message4: req.body.message4 ? JSON.parse(req.body.message4) : [],
    message5: req.body.message5 ? JSON.parse(req.body.message5) : [],
    sendTime: req.body.sendTime ? JSON.parse(req.body.sendTime) : [],
    userId: id
  };

  medias.forEach(file => {
    if (file.mimetype === "text/csv") return;
    const message1 = campaignData.message1?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message2 = campaignData.message2?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message3 = campaignData.message3?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message4 = campaignData.message4?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });
    const message5 = campaignData.message5?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });

    campaignData = {
      ...campaignData,
      message1,
      message2,
      message3,
      message4,
      message5
    };
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    inicialDate: Yup.string().required(),
    columnName: Yup.string().required(),
    sendTime: Yup.array().required(),
    message1: Yup.array(),
    message2: Yup.array(),
    message3: Yup.array(),
    message4: Yup.array(),
    message5: Yup.array(),
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
