import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import createGroupService from "../services/GroupServices/CreateGroupService";

interface GroupCreateData {
  groupName: string;
  contacts: { id: number; name: string; number: string }[];
  userId: number;
  whatsappId: number;
}

export const store = async (req: Request, res: Response) => {
  const { groupName, contacts, userId, whatsappId }: GroupCreateData = req.body;
  const { id, profile } = req.user;
  // const contactsCSV = req.files as Express.Multer.File[];
  console.log("", whatsappId);
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
