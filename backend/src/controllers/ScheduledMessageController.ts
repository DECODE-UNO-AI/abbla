import * as Yup from "yup";
import { Request, Response } from "express";

import CreateSheduledMessageService from "../services/ScheduledMessageServices/CreateScheduledMessageService";
import AppError from "../errors/AppError";
import ShowSheduledMessagesService from "../services/ScheduledMessageServices/ShowSheduledMessagesService";
import DeleteScheduledMessageService from "../services/ScheduledMessageServices/DeleteScheduledMessageService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  if (!contactId) {
    throw new AppError("ERR_NO_CONTACT_ID");
  }

  const scheduledMessages = await ShowSheduledMessagesService(contactId);

  return res.status(200).json({ scheduledMessages });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { body, inicialDate, contactId, ticketId } = req.body;
  const { id } = req.user;

  const data = {
    body,
    inicialDate,
    contactId,
    ticketId,
    userId: +id
  };

  if (new Date(inicialDate) < new Date()) {
    throw new AppError("ERR_INVALID_DATE");
  }

  const schema = Yup.object().shape({
    body: Yup.string().required(),
    inicialDate: Yup.string().required(),
    contactId: Yup.string().required(),
    userId: Yup.number().required(),
    ticketId: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (error) {
    throw new AppError(error.message);
  }

  const message = await CreateSheduledMessageService(data);

  return res.status(200).json({ message });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { scheduleMessageId } = req.params;

  if (!scheduleMessageId) {
    throw new AppError("ERR_NO_MESSAGE_ID");
  }

  await DeleteScheduledMessageService(scheduleMessageId);

  return res.status(200).json({ scheduleMessageId });
};
