import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

interface Request {
  contactId: string | number;
  isGroup: boolean;
  pageNumber?: string;
}

const getContactMessages = async ({
  contactId,
  isGroup,
  pageNumber = "1"
}: Request) => {
  if (contactId) {
    const limit = 20;
    const offset = limit * (+pageNumber - 1);

    const messages = await Message.findAll({
      where: { contactId },
      limit,
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
      offset,
      order: [["createdAt", "DESC"]]
    });

    return messages.reverse();
  }

  return [];
};

export default getContactMessages;
