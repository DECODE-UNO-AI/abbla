import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as CampaignController from "../controllers/CampaignController";

const campaignRoutes = express.Router();
const upload = multer(uploadConfig);

campaignRoutes.post(
  "/campaigns",
  isAuth,
  upload.array("medias"),
  CampaignController.store
);

campaignRoutes.get("/campaigns", isAuth, CampaignController.index);

campaignRoutes.get("/campaigns/:campaignId", isAuth, CampaignController.show);

campaignRoutes.get(
  "/campaigns/details/:campaignId",
  isAuth,
  CampaignController.showCampaignDetails
);

campaignRoutes.put(
  "/campaigns/cancel/:campaignId",
  isAuth,
  CampaignController.cancelCampaign
);

campaignRoutes.put(
  "/campaigns/pause/:campaignId",
  isAuth,
  CampaignController.pauseCampaign
);

campaignRoutes.put(
  "/campaigns/play/:campaignId",
  isAuth,
  CampaignController.playCampaign
);

campaignRoutes.put(
  "/campaigns/:campaignId",
  isAuth,
  upload.array("medias"),
  CampaignController.update
);

campaignRoutes.delete(
  "/campaigns/:campaignId",
  isAuth,
  CampaignController.remove
);

export default campaignRoutes;
