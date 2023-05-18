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
}: Request): Promise<{ messages: Message[]; hasMore: boolean }> => {
  if (contactId) {
    const limit = 20;
    const offset = limit * (+pageNumber - 1);

    const { count, rows: messages } = await Message.findAndCountAll({
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

    const hasMore = count > offset + messages.length;

    return {
      messages: messages.reverse(),
      hasMore
    };
  }

  return {
    messages: [],
    hasMore: false
  };
};

export default getContactMessages;
