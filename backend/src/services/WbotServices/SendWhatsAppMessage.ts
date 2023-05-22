import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";

import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  isComment?: boolean;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  isComment = false
}: Request): Promise<WbotMessage | string> => {
  let quotedMsgSerializedId: string | undefined;

  try {
    if (quotedMsg) {
      await GetWbotMessage(ticket, quotedMsg?.id);
      quotedMsgSerializedId = SerializeWbotMsgId(ticket, quotedMsg);
    }

    const wbot = await GetTicketWbot(ticket);

    if (!isComment) {
      const sentMessage = await wbot.sendMessage(
        `${ticket?.contact?.number}@${ticket?.isGroup ? "g" : "c"}.us`,
        formatBody(body, ticket),
        ticket?.isGroup
          ? {
              linkPreview: false
            }
          : {
              quotedMessageId: quotedMsgSerializedId,
              linkPreview: false
            }
      );

      await ticket.update({ lastMessage: body });
      return sentMessage;
    }

    const messageData = {
      id: `comment-${Date.now()}`,
      ticketId: ticket?.id,
      body,
      fromMe: true,
      read: true,
      isComment
    };

    await CreateMessageService({ messageData });

    return "commented";
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
