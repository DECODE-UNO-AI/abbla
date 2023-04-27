import Whatsapp from "../../models/Whatsapp";
import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "./StartWhatsAppSession";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  const whatsapps = await ListWhatsAppsService();
  if (whatsapps.length > 0) {
    whatsapps
      .filter(
        whatsapp =>
          whatsapp.status === "CONNECTED" || whatsapp.status === "qrcode"
      )
      .forEach(whatsapp => {
        StartWhatsAppSession(whatsapp);
      });
  }
};
