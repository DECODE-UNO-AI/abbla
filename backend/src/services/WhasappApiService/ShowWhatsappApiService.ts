import WhatsappApi from "../../models/WhatsappApi";

const ShowWhatsappApiService = async (id: string | number): Promise<WhatsappApi | null> => {

  const whastapp = await WhatsappApi.findByPk(id);

  return whastapp;
}

export default ShowWhatsappApiService;
