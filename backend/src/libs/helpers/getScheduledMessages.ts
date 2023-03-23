import ScheduledMessage from "../../models/ScheduledMessage";

const getScheduledMessages = async (): Promise<ScheduledMessage[]> => {
  const messages = await ScheduledMessage.findAll({
    where: {
      status: "scheduled"
    }
  });

  return messages;
};

export default getScheduledMessages;
