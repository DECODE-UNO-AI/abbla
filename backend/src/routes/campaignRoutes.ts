import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as CampaignController from "../controllers/CampaignController";

const campaignRoutes = express.Router();
const upload = multer(uploadConfig);

campaignRoutes.post(
  "/campaings",
  isAuth,
  upload.array("medias"),
  CampaignController.store
);

campaignRoutes.get("/campaings", isAuth, CampaignController.index);

export default campaignRoutes;
