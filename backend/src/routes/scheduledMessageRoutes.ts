import express from "express";
import isAuth from "../middleware/isAuth";
import multer from "multer";
import uploadConfig from "../config/upload";
import * as ScheduledMessageController from "../controllers/ScheduledMessageController";

const scheduleMessageRoutes = express.Router();
const upload = multer(uploadConfig);

scheduleMessageRoutes.post(
  "/scheduleMessage",
  isAuth,
  upload.array("medias"),
  ScheduledMessageController.store
);

scheduleMessageRoutes.get(
  "/scheduleMessage/:contactId",
  isAuth,
  ScheduledMessageController.index
);

scheduleMessageRoutes.delete(
  "/scheduleMessage/:scheduleMessageId",
  isAuth,
  ScheduledMessageController.remove
);

export default scheduleMessageRoutes;
