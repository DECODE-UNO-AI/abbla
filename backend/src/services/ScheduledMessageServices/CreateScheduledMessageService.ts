import ScheduledMessage from "../../models/ScheduledMessage";
import { startScheduledMessageJob } from "../../libs/scheduledMessageQueue";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface MessageData {
  body: string;
  inicialDate: string;
  contactId: number;
  ticketId: number;
  userId: number;
}

const CreateSheduledMessageService = async ({
  body,
  inicialDate,
  contactId,
  ticketId,
  userId
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
    startScheduledMessageJob(newScheduledMessage, ticket);
    return newScheduledMessage;
  } catch (err) {
    console.log(err);
    throw new Error("ERR_CREATING_MESSAGE");
  }
};

export default CreateSheduledMessageService;
