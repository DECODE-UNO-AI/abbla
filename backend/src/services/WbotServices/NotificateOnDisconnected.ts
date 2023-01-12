import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import ListAdminsService from "../UserServices/ListAdminsService";
import ListAllDepartamentsUsersService from "../UserServices/ListAllDepartamentsUsersService";

const NotificateOnDisconnected = async (whatsapp: Whatsapp): Promise<void> => {
  // Getting setting of notifications
  const shouldNotificate = await ListSettingsServiceOne({
    key: "notificateOnDisconnect"
  });
  if (!shouldNotificate || shouldNotificate.value === "disabled") return;
  // Getting connection to notificate
  const whatsId = await ListSettingsServiceOne({
    key: "notificationWhatsappId"
  });

  if (!whatsId || !whatsId.value || whatsId.value === "null") return;

  const wbot = getWbot(+whatsId.value);

  const wbotStatus = await wbot.getState();

  if (!wbot || !wbotStatus) return;

  const notificateAdmins = await ListSettingsServiceOne({
    key: "notificateAdminOnDisconnect"
  });
  const shouldNotificateAdmins = notificateAdmins?.value;

  if (shouldNotificateAdmins) {
    const admins = await ListAdminsService();
    admins.forEach(admin => {
      setTimeout(async () => {
        if (
          admin.whatsappNumber &&
          admin.whatsappNumber !== "null" &&
          admin.whatsappNumber !== ""
        ) {
          console.log(admin.whatsappNumber);
          try {
            await wbot.sendMessage(`${admin.whatsappNumber}@c.us`, "oi");
          } catch (err) {
            logger.error(err);
          }
        }
      }, 2000);
    });
  }

  const NotificateDepartaments = await ListSettingsServiceOne({
    key: "notificateDepartamentOnDisconnect"
  });
  const shouldNotificateDepartaments = NotificateDepartaments?.value;

  if (shouldNotificateDepartaments) {
    const { queues } = whatsapp;
    const queuesId = queues.map(q => q.id);
    const supervisors = await ListAllDepartamentsUsersService(queuesId);
    supervisors.forEach(supervisor => {
      setTimeout(async () => {
        if (
          supervisor.whatsappNumber &&
          supervisor.whatsappNumber !== "null" &&
          supervisor.whatsappNumber !== ""
        ) {
          console.log(supervisor.whatsappNumber);
          try {
            await wbot.sendMessage(`${supervisor.whatsappNumber}@c.us`, "oi");
          } catch (err) {
            logger.error(err);
          }
        }
      }, 2000);
    });
  }
};

export default NotificateOnDisconnected;

// try {
//   const wbot = getWbot(1);
//   await wbot.sendMessage("553791701381@c.us", "mensagem teste");
// } catch (err) {
//   console.log(err);
// }
