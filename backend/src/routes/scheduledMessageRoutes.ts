import express from "express";
import isAuth from "../middleware/isAuth";
import * as ScheduledMessageController from "../controllers/ScheduledMessageController";

const scheduleMessageRoutes = express.Router();

scheduleMessageRoutes.post(
  "/scheduleMessage",
  isAuth,
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
