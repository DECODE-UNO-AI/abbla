import Message from "../../models/Message";

interface Request {
  contactId: string | number;
}

// interface Response {
//   messages: Message | null;
// }

const getContactMessages = async ({ contactId }: Request) => {
  const messages = await Message.findAll({
    where: { contactId },
    include: [
      "contact",
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return messages.reverse();
};

export default getContactMessages;
