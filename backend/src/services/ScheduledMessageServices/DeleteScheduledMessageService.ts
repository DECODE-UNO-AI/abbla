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
    if (message.status !== "scheduled") {
      throw new AppError("ERR_MESSAGE_NOT_SCHEDULED", 400);
    }
    finishScheduledMessageJob(messageId);
    message.destroy();
  } catch (err) {
    throw new AppError(err);
  }
};

export default DeleteScheduledMessageService;
