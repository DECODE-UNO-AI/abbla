import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import createGroupService from "../services/GroupServices/CreateGroupService";
import addParticipantsToGroupService from "../services/GroupServices/addParticipantsToGroupService";
import getAllParticipantsService from "../services/GroupServices/GetAllParticipantsService";

interface GroupCreateData {
  groupName: string;
  contacts: { id: number; name: string; number: string }[];
  userId: number;
  whatsappId: number;
}

interface AddParticipantsData {
  groupId: string;
  participants: { id: number; name: string; number: string }[];
  whatsappId: number;
}

interface getAllParticipantsData {
  groupId: string;
  whatsappId: number;
}

export const store = async (req: Request, res: Response) => {
  const { groupName, contacts, userId, whatsappId }: GroupCreateData = req.body;
  const { profile } = req.user;
  // const contactsCSV = req.files as Express.Multer.File[];
  if (!whatsappId) {
    throw new AppError("WHATSAPPID_IS_REQUIRED", 403);
  }

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const schemaToContacts = Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      name: Yup.string().required(),
      number: Yup.string().required()
    })
  );

  const schemaToGroupName = Yup.string().required();

  const schemaToWhatsappId = Yup.number().required();

  try {
    await schemaToContacts.validate(contacts);
    await schemaToGroupName.validate(groupName);
    await schemaToWhatsappId.validate(whatsappId);
  } catch (error) {
    throw new AppError(error.message);
  }

  try {
    await createGroupService({
      groupName,
      contacts,
      userId,
      whatsappId
    });

    return res.status(201).send();
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const addParticipantsToGroup = async (req: Request, res: Response) => {
  const { groupId, participants, whatsappId }: AddParticipantsData = req.body;
  const { profile } = req.user;

  if (!groupId) {
    throw new AppError("GROUPID_IS_REQUIRED", 403);
  }

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    await addParticipantsToGroupService({ groupId, participants, whatsappId });

    return res.status(200).send();
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const getAllParticipants = async (req: Request, res: Response) => {
  const { groupId, whatsappId }: getAllParticipantsData = req.body;

  try {
    const participants = await getAllParticipantsService({
      groupId,
      whatsappId
    });

    return res.status(200).json({ participants });
  } catch (error) {
    throw new AppError(error.message);
  }
};
