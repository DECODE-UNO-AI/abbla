import { GroupChat } from "whatsapp-web.js";
import { getWbot } from "../../libs/wbot";
import UpdateContactService from "../ContactServices/UpdateContactService";
import { getIO } from "../../libs/socket";

interface EditGroupData {
  groupName: string;
  groupImage: string | null;
  groupId: string;
  whatsappId: number;
  contactId: string;
}

const editGroupService = async ({
  groupName,
  groupImage,
  groupId,
  whatsappId,
  contactId
}: EditGroupData) => {
  const wbot = await getWbot(whatsappId);

  const group = (await wbot.getChatById(`${groupId}@g.us`)) as GroupChat;

  await group.setSubject(groupName);

  const contact = await UpdateContactService({
    contactData: { name: groupName, number: group?.id?.user, email: "" },
    contactId
  });

  const io = getIO();
  io.emit("contact", {
    action: "update",
    contact
  });

  return;
};

export default editGroupService;
