import { GroupChat } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";

interface RemoveParticipant {
  contactIds: string[];
  groupId: string;
  whatsappId: number;
}

const removeParticipantService = async ({
  contactIds,
  groupId,
  whatsappId
}: RemoveParticipant) => {
  const wbot = await getWbot(whatsappId);

  const group = (await wbot.getChatById(`${groupId}@g.us`)) as GroupChat;

  return group.removeParticipants(contactIds);
};

export default removeParticipantService;
