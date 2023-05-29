import { GroupChat } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";

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

  const participants = group.participants.map(participant => ({
    number: participant.id.user
  }));

  return participants;
};

export default getAllParticipantsService;
