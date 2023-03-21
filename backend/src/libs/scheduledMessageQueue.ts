import schedule from "node-schedule";
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
  const job = schedule.scheduleJob(startDate, () => {
    SendWhatsAppMessage({
      body: sheduledMessage.body,
      ticket
    });
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
