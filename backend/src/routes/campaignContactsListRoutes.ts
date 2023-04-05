import { Router } from "express";
import * as CampaignContactsListController from "../controllers/CampaignContactsListController"
import isAuth from "../middleware/isAuth";

const CampaignContactsListRoutes = Router();

CampaignContactsListRoutes.post("/", isAuth, CampaignContactsListController.store);
CampaignContactsListRoutes.get("/", isAuth,  CampaignContactsListController.index);
CampaignContactsListRoutes.get("/:campaignContactsListId/:page", isAuth, CampaignContactsListController.showContacts);
CampaignContactsListRoutes.delete("/:campaignContactsListId", isAuth, CampaignContactsListController.remove);
CampaignContactsListRoutes.delete("/removecontact/:campaignContactsListId/:contactId", isAuth, CampaignContactsListController.removeContact);


export default CampaignContactsListRoutes;
