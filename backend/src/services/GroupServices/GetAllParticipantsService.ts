import { GroupChat } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";

interface getAllParticipantsData {
  groupId: string;
  whatsappId: number;
}

const getAllParticipantsService = async ({
  groupId,
  whatsappId
}: getAllParticipantsData) => {
  const wbot = await getWbot(whatsappId);

  const group = (await wbot.getChatById(`${groupId}@g.us`)) as GroupChat;

  const participants = group.participants.map(
    participant => participant.id.user
  );

  const contacts = await Contact.findAll({
    where: {
      number: participants
    },
    attributes: ["id", "name", "number"]
  });

  return contacts;
};

export default getAllParticipantsService;
