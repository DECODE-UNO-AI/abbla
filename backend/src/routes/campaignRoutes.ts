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

campaignRoutes.put(
  "/campaigns/:campaignId",
  isAuth,
  upload.array("medias"),
  CampaignController.update
);

export default campaignRoutes;
