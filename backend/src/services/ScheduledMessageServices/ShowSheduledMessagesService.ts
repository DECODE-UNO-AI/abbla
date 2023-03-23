import AppError from "../../errors/AppError";
import ScheduledMessage from "../../models/ScheduledMessage";

const ShowSheduledMessagesService = async (
  contactId: string | number
): Promise<ScheduledMessage[] | null> => {
  try {
    const messages = await ScheduledMessage.findAll({ where: { contactId } });
    return messages;
  } catch (err) {
    throw new AppError("INTERNAL_ERROR", 500);
  }
};

export default ShowSheduledMessagesService;
