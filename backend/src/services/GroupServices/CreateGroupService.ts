import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getIO } from "../../libs/socket";
import { getWbot } from "../../libs/wbot";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import CreateContactService from "../ContactServices/CreateContactService";
import CreateTicketService from "../TicketServices/CreateTicketService";

interface GroupCreateData {
  groupName: string;
  contacts: { id: number; name: string; number: string }[];
  userId: number;
  whatsappId: number;
}

type CreateGroup = {
  gid: {
    server: string;
    user: string;
    _serialized: string;
  };
  missingParticipants: any;
};

const createGroupService = async ({
  groupName,
  contacts,
  userId,
  whatsappId
}: GroupCreateData) => {
  const wbot = await getWbot(whatsappId);
  const contactIds = contacts.map(contact => `${contact.number}@c.us`);

  const { gid } = (await wbot.createGroup(
    groupName,
    contactIds
  )) as unknown as CreateGroup;

  const { id } = await CreateContactService({
    name: groupName,
    number: gid.user,
    isGroup: true
  });

  const ticket = await CreateTicketService({
    contactId: id,
    status: "open",
    userId,
    queueId: 1
  });

  const io = getIO();
  io.to(ticket.status).emit("ticket", {
    action: "update",
    ticket
  });
};

export default createGroupService;
