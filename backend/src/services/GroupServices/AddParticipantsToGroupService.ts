import { GroupChat } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";

interface AddParticipantsData {
  groupId: string;
  participants: { id: number; name: string; number: string }[];
  whatsappId: number;
}

const addParticipantsToGroupService = async ({
  groupId,
  participants,
  whatsappId
}: AddParticipantsData) => {
  const wbot = await getWbot(whatsappId);
  const participantIds = participants.map(
    participant => `${participant.number}@c.us`
  );

  const group = (await wbot.getChatById(`${groupId}@g.us`)) as GroupChat;

  const addParticipants = await group.addParticipants(participantIds);

  return addParticipants;
};

export default addParticipantsToGroupService;
