import { Request, Response } from "express";
import AppError from "../errors/AppError";
import CreateCampaignContactsListService from "../services/CampaignContactsListService/CreateCampaignContactsListService";
import ListCampaignContactsListsService from "../services/CampaignContactsListService/ListCampaignContactsListsService";
import ShowCampaignAllContactsList from "../services/CampaignContactsListService/ShowCampaignAllContactsList";

export const index = async (req: Request, res: Response): Promise<Response> => {
  // const { profile } = req.user;

  // if (profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  try {
    const lists = await ListCampaignContactsListsService();
    return res.status(200).json({ lists });
  } catch (err) {
    throw new AppError("INTERNAL_ERR", 500);
  }
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, contactsIds } = req.body;
  // const { profile } = req.user;

  // if (profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  if(!contactsIds) {
    throw new AppError("NO_CONTACTS_FILE", 404);
  }

  try {
    const newList = await CreateCampaignContactsListService({ name, contactsIds});
    return res.status(200).json({ list: newList });
  } catch (err) {
    throw new AppError("INTERNAL_ERR", 500);
  }
}

export const showContacts = async (req: Request, res: Response): Promise<Response> => {
  const { campaignContactsListId } = req.params;

  if(!campaignContactsListId) {
    throw new AppError("LIST_NOT_FOUND", 404);
  }

  try {
    const contacts = await ShowCampaignAllContactsList(campaignContactsListId);
    return res.status(200).json({ contacts });
  } catch (err) {
    throw new AppError("INTERNAL_ERR", 500);
  }
}
