import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import CreateMacroService from "../services/MacroService/CreateMacroService";
import GetAllMacrosService from "../services/MacroService/GetAllMacrosService";
import ListMacroService from "../services/MacroService/ListMacroService";
import GetMacroByIdService from "../services/MacroService/GetMacroByIdService";
import UpdateMacroService from "../services/MacroService/UpdateMacroService";
import DeleteMacroService from "../services/MacroService/DeleteMacroService";
import TestCampaignService from "../services/CampaignServices/TestCampaignService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};
interface MacroData {
  name: string;
  message1: string[];
  userId: string;
  id?: string;
  shortcut?: string;
  createdAt?: string;
  updatedAt?: string;
  whatsappId?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { macros, count, hasMore } = await ListMacroService({
    searchParam,
    pageNumber
  });

  return res.json({ macros, count, hasMore });
};

export const store = async (req: Request, res: Response) => {
  const { id, profile } = req.user;
  const medias = req.files as Express.Multer.File[];
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  let macro: MacroData = {
    ...req.body,
    message1: req.body.message1 ? JSON.parse(req.body.message1) : [],
    userId: id
  };

  if (!macro.message1 || macro.message1.length < 1) {
    throw new AppError("INVALID_MESSAGES");
  }

  medias.forEach(file => {
    if (file.mimetype === "text/csv") return;
    const message1 = macro.message1?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });

    macro = {
      ...macro,
      message1
    };
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    message1: Yup.array(),
    userId: Yup.string().required()
  });

  try {
    await schema.validate(macro);
  } catch (error) {
    throw new AppError(error.message);
  }

  try {
    const newMacro = await CreateMacroService({ macro });
    await newMacro.reload();

    const io = getIO();
    io.emit("macros", {
      action: "create",
      macro: newMacro
    });

    return res.status(201).send();
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const getAllMacros = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const macros = await GetAllMacrosService();

    return res.status(200).json(macros);
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const getMacroById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { macroId } = req.params;
  try {
    const macro = await GetMacroByIdService({ macroId });

    return res.status(200).json({ macro });
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const update = async (req: Request, res: Response) => {
  const { macroId } = req.params;
  const { id, profile } = req.user;

  const medias = req.files as Express.Multer.File[];
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  let macro: MacroData = {
    ...req.body,
    message1: req.body.message1 ? JSON.parse(req.body.message1) : [],
    userId: id
  };

  if (!macro.message1 || macro.message1.length < 1) {
    throw new AppError("INVALID_MESSAGES");
  }

  medias.forEach(file => {
    if (file.mimetype === "text/csv") return;
    const message1 = macro.message1?.map((str: string) => {
      if (file.filename.includes(str.replace("file-", ""))) {
        return `file-${file.filename}`;
      }
      return str;
    });

    macro = {
      ...macro,
      message1
    };
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    message1: Yup.array(),
    userId: Yup.string().required()
  });

  try {
    await schema.validate(macro);
  } catch (error) {
    throw new AppError(error.message);
  }

  try {
    const newMacro = await UpdateMacroService({ macroId, macroData: macro });

    const io = getIO();
    io.emit("macros", {
      action: "update",
      macro: newMacro
    });

    return res.status(201).send();
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const deleteMacro = async (req: Request, res: Response) => {
  const { macroId } = req.params;
  const { profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    await DeleteMacroService({ macroId });

    const io = getIO();
    io.emit("macros", {
      action: "delete",
      macroId
    });

    return res.status(204).send();
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const testMacro = async (req: Request, res: Response) => {
  const { profile } = req.user;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const schema = Yup.object().shape({
    number: Yup.string().required(),
    message: Yup.array().required(),
    whatsappId: Yup.string().required()
  });

  const macroData: {
    message: string[];
    number: string;
    whatsappId: string;
  } = {
    message: req.body.message ? JSON.parse(req.body.message) : [],
    number: req.body.number,
    whatsappId: req.body.whatsappId
  };

  const medias = req.files as Express.Multer.File[];

  try {
    await schema.validate(macroData);
  } catch (error) {
    throw new AppError(error.message);
  }

  await TestCampaignService({ campaignData: macroData, medias });

  return res.status(200).json({ message: "message sent" });
};
