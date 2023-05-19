import schedule from "node-schedule";
import ScheduleMessage from "../models/ScheduledMessage";
import Ticket from "../models/Ticket";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

import { logger } from "../utils/logger";
import getScheduledMessages from "./helpers/getScheduledMessages";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";

export const allScheduledMessagejobs: Array<{
  id: string | number;
  job: schedule.Job;
}> = [];

export const finishScheduledMessageJob = (jobId: string | number): void => {
  const jobIndex = allScheduledMessagejobs.findIndex(job => job.id === +jobId);
  const job = allScheduledMessagejobs[jobIndex];
  if (job) {
    try {
      job.job.cancel();
    } catch (err) {
      logger.error(err);
    }
    allScheduledMessagejobs.splice(jobIndex, 1);
  }
};

export const startAllScheduledMessagesJobs = (): void => {
  getScheduledMessages().then(messages => {
    messages.forEach(async message => {
      const startDate: Date = new Date(message.inicialDate);
      const currentData = new Date();
      const scheduledDate = new Date(message.inicialDate);
      const diff = scheduledDate.getTime() - currentData.getTime();
      if (diff < 0) {
        message.update({ status: "failed" });
        return;
      }

      const job = schedule.scheduleJob(startDate, async () => {
        try {
          const ticket = await ShowTicketService(+message.ticketId);
          if (!ticket) {
            await message.update({ status: "failed" });
            return;
          }
          await SendWhatsAppMessage({
            body: message.body,
            ticket
          });
          await message.update({ status: "sent" });
          finishScheduledMessageJob(message.id);
        } catch (err) {
          await message.update({ status: "failed" });
        }
      });
      allScheduledMessagejobs.push({ id: message.id, job });
    });
  });
};

export const startScheduledMessageJob = (
  scheduledMessage: ScheduleMessage,
  ticket: Ticket,
  medias?: Express.Multer.File[]
): void => {
  const startDate: Date = new Date(scheduledMessage.inicialDate);
  const job = schedule.scheduleJob(startDate, async () => {
    try {
      if (medias) {
        await Promise.all(
          medias.map(async (media: Express.Multer.File) => {
            await SendWhatsAppMedia({ media, ticket });
          })
        );
      } else {
        await SendWhatsAppMessage({
          body: scheduledMessage.body,
          ticket
        });
      }
      await scheduledMessage.update({ status: "sent" });
      finishScheduledMessageJob(scheduledMessage.id);
    } catch (err) {
      await scheduledMessage.update({ status: "failed" });
    }
  });
  allScheduledMessagejobs.push({ id: scheduledMessage.id, job });
};
