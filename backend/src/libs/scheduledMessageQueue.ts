import schedule from "node-schedule";
import AppError from "../errors/AppError";
import ScheduleMessage from "../models/ScheduledMessage";
import Ticket from "../models/Ticket";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

import { logger } from "../utils/logger";

export const allScheduledMessagejobs: Array<{
  id: string | number;
  job: schedule.Job;
}> = [];

export const startScheduledMessageJob = (
  sheduledMessage: ScheduleMessage,
  ticket: Ticket
): void => {
  const startDate: Date | number = new Date(sheduledMessage.inicialDate);
  const job = schedule.scheduleJob(startDate, async () => {
    try {
      await SendWhatsAppMessage({
        body: sheduledMessage.body,
        ticket
      });
      await sheduledMessage.update({ status: "sent" });
    } catch (err) {
      await sheduledMessage.update({ status: "failed" });
      throw new AppError(err);
    }
  });
  allScheduledMessagejobs.push({ id: sheduledMessage.id, job });
};

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
