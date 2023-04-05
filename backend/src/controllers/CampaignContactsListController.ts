import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import CreateCampaignContactsListService from "../services/CampaignContactsListService/CreateCampaignContactsListService";
import DeleteCampaignContactsList from "../services/CampaignContactsListService/DeleteCampaignContactsList";
import ListCampaignContactsListsService from "../services/CampaignContactsListService/ListCampaignContactsListsService";
import ShowCampaignAllContactsList from "../services/CampaignContactsListService/ShowCampaignAllContactsList";
import DeleteContactFromCampaignContactsListService from "../services/CampaignContactsListService/DeleteContactFromCampaignContactsListService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    const lists = await ListCampaignContactsListsService();
    return res.status(200).json({ lists });
  } catch (err) {
    throw new AppError("INTERNAL_ERR", 500);
  }
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, filterOptions } = req.body;
  const { profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    const newList = await CreateCampaignContactsListService({ name, filterOptions});
    const io = getIO();
    io.emit("contactsList", {
      action: "create",
      contactList: newList
    });
    return res.status(200).json({ list: newList });
  } catch (err) {
    throw new AppError("INTERNAL_ERR", 500);
  }
}

export const showContacts = async (req: Request, res: Response): Promise<Response> => {
  const { campaignContactsListId, page } = req.params;

  const { profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if(!campaignContactsListId) {
    throw new AppError("LIST_NOT_FOUND", 404);
  }

  try {
    const {contacts, count, hasMore} = await ShowCampaignAllContactsList(campaignContactsListId, false, page);
    return res.status(200).json({ contacts, count, hasMore });
  } catch (err) {
    throw new AppError("INTERNAL_ERR", 500);
  }
}

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { campaignContactsListId } = req.params;

  const { profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if(!campaignContactsListId) {
    throw new AppError("LIST_NOT_FOUND", 404);
  }

  try {
    await DeleteCampaignContactsList(campaignContactsListId);
    const io = getIO();
    io.emit("contactsList", {
      action: "delete",
      contactListId : campaignContactsListId
    });
    return res.status(200).json({ message: "deleted" });
  } catch (err) {
    throw new AppError("INTERNAL_ERR", 500);
  }
}

export const removeContact = async (req: Request, res: Response): Promise<Response> => {
  const { campaignContactsListId, contactId } = req.params;

  try {
    await DeleteContactFromCampaignContactsListService(contactId, campaignContactsListId)
    return res.status(200).json({ message: "contact removed"})
  } catch (err) {
    throw new AppError(err)
  }
}
