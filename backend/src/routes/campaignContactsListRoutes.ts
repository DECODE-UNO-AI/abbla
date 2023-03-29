import { Router } from "express";
import * as CampaignContactsListController from "../controllers/CampaignContactsListController"
import isAuth from "../middleware/isAuth";

const CampaignContactsListRoutes = Router();

CampaignContactsListRoutes.post("/",  CampaignContactsListController.store);
CampaignContactsListRoutes.get("/",  CampaignContactsListController.index);
CampaignContactsListRoutes.get("/:campaignContactsListId",  CampaignContactsListController.showContacts);



export default CampaignContactsListRoutes;
