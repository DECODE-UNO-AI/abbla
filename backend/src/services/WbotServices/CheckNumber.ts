import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckContactNumber = async (number: string): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = await getWbot(defaultWhatsapp.id);

  const validNumber: any = await wbot.getNumberId(`${number}@c.us`);
  return validNumber.user;
};

export default CheckContactNumber;
