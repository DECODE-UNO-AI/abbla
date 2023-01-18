import schedule from "node-schedule";
import Campaign from "../models/Campaign";

import getCampaigns from "./helpers/getCampaigns";
import sendMessageCampaign from "./helpers/sendMessageCampaign";

export const alljobs: Array<{
  id: string | number;
  job: schedule.Job;
}> = [];

export const startJobs = (): void => {
  getCampaigns().then(jobQueues =>
    jobQueues.forEach(async jobQueue => {
      const date = jobQueue.start;
      const startDate = new Date(Date.now() + 1000);
      const job = schedule.scheduleJob(startDate, () => {
        console.log("aqui")
        sendMessageCampaign(jobQueue);
      });
      alljobs.push({ id: jobQueue.id, job });
    })
  );
};

export const startJob = (campaign: Campaign): void => {
  const date = campaign.start;
  const job = schedule.scheduleJob(date, () => {
    console.log("nova campanha");
  });
  alljobs.push({ id: campaign.id, job });
};
