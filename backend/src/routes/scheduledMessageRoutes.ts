import express from "express";
import isAuth from "../middleware/isAuth";
import * as ScheduledMessageController from "../controllers/ScheduledMessageController";

const scheduleMessageRoutes = express.Router();

scheduleMessageRoutes.post(
  "/scheduleMessage",
  isAuth,
  ScheduledMessageController.store
);

export default scheduleMessageRoutes;
