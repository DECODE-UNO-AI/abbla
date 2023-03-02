import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import { init as StartApiSessions } from "../../libs/wbot-api";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  StartApiSessions()
  const whatsapps = await ListWhatsAppsService();
  if (whatsapps.length > 0) {
    whatsapps.forEach(whatsapp => {
      StartWhatsAppSession(whatsapp);
    });
  }
};
