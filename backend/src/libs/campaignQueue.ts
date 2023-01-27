import schedule from "node-schedule";
import Campaign from "../models/Campaign";
import { logger } from "../utils/logger";

import getCampaigns from "./helpers/getCampaigns";
import sendMessageCampaign from "./helpers/sendMessageCampaign";

export const alljobs: Array<{
  id: string | number;
  job: schedule.Job;
}> = [];

export const startJobs = (): void => {
  getCampaigns().then(jobQueues =>
    jobQueues.forEach(async jobQueue => {
      let startDate: Date | number = new Date(jobQueue.inicialDate);
      if (jobQueue.status === "processing") {
        startDate = Date.now() + 1000 * 60 * 10; // 1000 * 10; // Set a correct delay to restart whatsapp connections
      } else if (
        jobQueue.status === "scheduled" ||
        jobQueue.status === "timeout"
      ) {
        const currentData = new Date();
        const scheduledDate = new Date(jobQueue.inicialDate);
        const diff = scheduledDate.getTime() - currentData.getTime();
        if (diff < 0) {
          startDate = Date.now() + 1000 * 60 * 10; // 1000 * 10; // Set a correct delay to restart whatsapp connections
        }
      }
      const job = schedule.scheduleJob(startDate, () => {
        sendMessageCampaign(jobQueue);
      });
      alljobs.push({ id: jobQueue.id, job });
    })
  );
};

export const startJob = (campaign: Campaign): void => {
  const startDate: Date | number = new Date(campaign.inicialDate);
  const job = schedule.scheduleJob(startDate, () => {
    sendMessageCampaign(campaign);
  });
  alljobs.push({ id: campaign.id, job });
};

export const finishJob = (jobId: string | number): void => {
  const jobIndex = alljobs.findIndex(job => job.id === jobId);
  const job = alljobs[jobIndex];
  if (job) {
    try {
      job.job.cancel();
    } catch (err) {
      logger.error(err);
    }
    alljobs.splice(jobIndex, 1);
  }
};

export const reSheduleJob = (campaign: Campaign, date: Date): void => {
  const job = schedule.scheduleJob(date, () => {
    sendMessageCampaign(campaign);
  });
  finishJob(campaign.id);
  alljobs.push({ id: campaign.id, job });
};
