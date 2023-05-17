import ScheduledMessage from "../../models/ScheduledMessage";
import { startScheduledMessageJob } from "../../libs/scheduledMessageQueue";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { logger } from "../../utils/logger";

interface MessageData {
  body: string;
  inicialDate: string;
  contactId: number;
  ticketId: number;
  userId: number;
  medias?: Express.Multer.File[];
}

const CreateSheduledMessageService = async ({
  body,
  inicialDate,
  contactId,
  ticketId,
  userId,
  medias
}: MessageData): Promise<ScheduledMessage> => {
  try {
    const newScheduledMessage = await ScheduledMessage.create({
      body,
      inicialDate,
      contactId: +contactId,
      ticketId: +ticketId,
      userId
    });
    const ticket = await ShowTicketService(+ticketId);
    if (!ticket) {
      await newScheduledMessage.update({ status: "failed" });
      throw new Error("ERR_CREATING_MESSAGE");
    }
    startScheduledMessageJob(newScheduledMessage, ticket, medias);
    return newScheduledMessage;
  } catch (err) {
    logger.error(err);
    throw new Error("ERR_CREATING_MESSAGE");
  }
};

export default CreateSheduledMessageService;
