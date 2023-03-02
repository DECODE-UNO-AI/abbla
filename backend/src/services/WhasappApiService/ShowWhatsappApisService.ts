import WhatsappApi from "../../models/WhatsappApi";

const ShowWhatsappApisService = async (): Promise<WhatsappApi[]> => {

  const whastapps = await WhatsappApi.findAll({});

  return whastapps
}

export default ShowWhatsappApisService;
