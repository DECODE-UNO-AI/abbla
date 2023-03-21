import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import CreateSheduledMessageService from "../services/ScheduledMessageServices/CreateScheduledMessageService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { body, inicialDate, contactId, ticketId } = req.body;
  const { id } = req.user;

  await CreateSheduledMessageService({
    body,
    inicialDate,
    contactId,
    ticketId,
    userId: +id
  });

  // return res.send();
};
