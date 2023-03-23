import * as Yup from "yup";

import crypto from "crypto";
import AppError from "../../errors/AppError";
import WhatsappApi from "../../models/WhatsappApi";
import axios from "axios";

const CreateWhatsappApiService = async (name: string): Promise<WhatsappApi> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This whatsapp name is already used.",
        async value => {
          if (!value) return false;
          const nameExists = await WhatsappApi.findOne({
            where: { name: value }
          });
          return !nameExists;
        }
      )
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const sessionId = crypto.randomBytes(16).toString("hex");

  const newWhatsappApi = await WhatsappApi.create({
    name,
    status: "OPENING",
    sessionId
  });

  const result = await axios.post(`${process.env.BAILEYS_API_HOST}/sessions/add`, { sessionId: newWhatsappApi.sessionId })

  await newWhatsappApi.update({ qrcode: result.data.qr, status: "qrcode" })

  return newWhatsappApi;
};

export default CreateWhatsappApiService;
