import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";

import * as ApiController from "../controllers/ApiController";
import * as GroupsController from "../controllers/GroupsController";
import isAuthApi from "../middleware/isAuthApi";

const upload = multer(uploadConfig);

const ApiRoutes = express.Router();

ApiRoutes.post("/send", isAuthApi, upload.array("medias"), ApiController.index);

ApiRoutes.post("/create", isAuthApi, GroupsController.store);

ApiRoutes.get("/getAll", isAuthApi, GroupsController.getGroups);

ApiRoutes.post(
  "/getAllParticipants",
  isAuthApi,
  GroupsController.getAllParticipants
);

export default ApiRoutes;
