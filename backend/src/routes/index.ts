import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import whatsappRoutes from "./whatsappRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import quickAnswerRoutes from "./quickAnswerRoutes";
import apiRoutes from "./apiRoutes";
import tagRoutes from "./tagRoutes";
import departamentRoutes from "./departamentRoutes";
import campaignRoutes from "./campaignRoutes";
import MacroRoutes from "./MacroRoutes";
import restartRoutes from "./restartRoutes";
import scheduleMessageRoutes from "./scheduledMessageRoutes";
import CampaignContactsListRoutes from "./campaignContactsListRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(quickAnswerRoutes);
routes.use("/api/messages", apiRoutes);
routes.use(tagRoutes);
routes.use(departamentRoutes);
routes.use("/service", restartRoutes);
routes.use(scheduleMessageRoutes);
if (process.env.CAMPAIGN_FUNCTION === "true") {
  routes.use("/campaigncontactslist", CampaignContactsListRoutes);
  routes.use(campaignRoutes);
}
if (process.env.MACRO_FUNCTION === "true") {
  routes.use(MacroRoutes);
}

export default routes;
