import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

interface Request {
  contactId: string | number;
  isGroup: boolean;
}

const getContactMessages = async ({ contactId, isGroup }: Request) => {
  if (contactId) {
    const messages = await Message.findAll({
      where: { contactId },
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        },
        {
          model: Ticket,
          where: {
            isGroup: isGroup ? 1 : 0
          },
          required: true
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return messages.reverse();
  }

  return [];
};

export default getContactMessages;
