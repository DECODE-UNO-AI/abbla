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

  // Getting personalizated message
  const notificateMessage = await ListSettingsServiceOne({
    key: "messageOnDisconnect"
  });
  const message =
    notificateMessage &&
    notificateMessage.value &&
    notificateMessage.value !== ""
      ? notificateMessage.value
      : "Deconexão: (name)";

  const replacedMessage = message
    .replace("(id)", `${whatsapp.id}`)
    .replace("(name)", `${whatsapp.name}`)
    .replace("(number)", `${whatsapp.number}`);

  // User notification
  const notificateUser = await ListSettingsServiceOne({
    key: "notificateUserOnDisconnect"
  });
  const shouldNotificateUser = notificateUser?.value;

  if (shouldNotificateUser) {
    const whatsNumber = whatsapp.number;
    if (whatsNumber && whatsNumber !== "null" && whatsNumber !== "") {
      try {
        await wbot.sendMessage(`${whatsNumber}@c.us`, replacedMessage);
      } catch (err) {
        logger.error(err);
      }
    }
  }

  // Admins notification
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
          try {
            await wbot.sendMessage(
              `${admin.whatsappNumber}@c.us`,
              replacedMessage
            );
          } catch (err) {
            logger.error(err);
          }
        }
      }, 2000);
    });
  }

  // Departaments Notification
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
          try {
            await wbot.sendMessage(
              `${supervisor.whatsappNumber}@c.us`,
              replacedMessage
            );
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
