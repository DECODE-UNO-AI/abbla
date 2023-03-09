import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import WhatsappApi from "../../models/WhatsappApi";

const DeleteWhatsAppApiService = async (whatsapp: WhatsappApi): Promise<void> => {

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.destroy();
};

export default DeleteWhatsAppApiService;
