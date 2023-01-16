import Whatsapp from "../../models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";

interface Response {
  whatsapp: Whatsapp;
}

const ResetWhatsappSession = async (
  whatsappId: string | number
): Promise<Response> => {
  const whatsapp = await ShowWhatsAppService(whatsappId);

  await whatsapp.update({
    session: ""
  });

  // await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp };
};

export default ResetWhatsappSession;
