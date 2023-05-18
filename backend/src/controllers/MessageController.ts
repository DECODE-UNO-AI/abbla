import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ListSettingsServiceOne from "../services/SettingServices/ListSettingsServiceOne";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import getContactMessages from "../services/MessageServices/getContactMessages";
import AppError from "../errors/AppError";

type IndexQuery = {
  pageNumber: string;
  contactId: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  isComment: boolean;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber, contactId } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
  });

  const { messages: allContactMessages, hasMore: hasMoreContactMessages } =
    await getContactMessages({
      contactId,
      isGroup: ticket.isGroup
    });

  const auxHasMore = hasMore || hasMoreContactMessages;

  const allMessages = [...allContactMessages, ...messages];

  // Setting vizualizeMessage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listSettingsService: any = await ListSettingsServiceOne({
    key: "visualizeMessage"
  });
  const option = listSettingsService?.dataValues.value;
  if (option === "disabled") await SetTicketMessagesAsRead(ticket);

  return res.json({
    count,
    messages: allMessages,
    ticket,
    hasMore: auxHasMore
  });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg, isComment }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  try {
    const ticket = await ShowTicketService(ticketId);

    // Setting vizualizeMessage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listSettingsService: any = await ListSettingsServiceOne({
      key: "visualizeMessage"
    });
    const option = listSettingsService?.dataValues.value;
    if (option === "disabled") await SetTicketMessagesAsRead(ticket);

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendWhatsAppMedia({ media, ticket });
        })
      );
    } else {
      await SendWhatsAppMessage({ body, ticket, quotedMsg, isComment });
    }
    return res.send();
  } catch (error) {
    throw new AppError(error.message);
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  if (typeof message !== "number") {
    io.to(message.ticketId.toString()).emit("appMessage", {
      action: "update",
      message
    });
  } else {
    io.to(message.toString()).emit("appMessage", {
      action: "delete",
      messageId
    });
  }

  return res.send();
};
