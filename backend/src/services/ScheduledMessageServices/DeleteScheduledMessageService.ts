import AppError from "../../errors/AppError";
import ScheduledMessage from "../../models/ScheduledMessage";
import { finishScheduledMessageJob } from "../../libs/scheduledMessageQueue";

const DeleteScheduledMessageService = async (
  messageId: string | number
): Promise<void> => {
  try {
    const message = await ScheduledMessage.findByPk(messageId);
    if (!message) {
      throw new AppError("ERR_NO_MESSAGE_FOUND", 404);
    }
    finishScheduledMessageJob(messageId);
    message.destroy();
  } catch (err) {
    throw new AppError(err);
  }
};

export default DeleteScheduledMessageService;
