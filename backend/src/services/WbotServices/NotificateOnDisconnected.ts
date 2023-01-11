import { getWbot } from "../../libs/wbot";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import ListAdminsService from "../UserServices/ListAdminsService";

const NotificateOnDisconnected = async (whatsapp: any): Promise<void> => {
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

  if (!wbot) return;

  const notificateAdmins = await ListSettingsServiceOne({
    key: "notificateAdminOnDisconnect"
  });
  const shouldNotificateAdmins = notificateAdmins?.value;
  // const NotificateDepartaments = await ListSettingsServiceOne({
  //   key: "notificateDepartamentOnDisconnect"
  // });
  // const shouldNotificateDepartaments = NotificateDepartaments?.value;

  // Getting Admins

  if (shouldNotificateAdmins) {
    const admins = await ListAdminsService();

    admins.forEach(admin => {
      if (
        admin.whatsappNumber &&
        admin.whatsappNumber !== "null" &&
        admin.whatsappNumber !== ""
      ) {
        // wbot.sendMessage();
        console.log(admin.whatsappNumber);
        wbot.sendMessage(`${admin.whatsappNumber}@$c.us`, "oi");
      }
    });
  }
};

export default NotificateOnDisconnected;
