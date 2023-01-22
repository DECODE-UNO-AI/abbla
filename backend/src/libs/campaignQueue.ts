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
      const startDate = jobQueue.inicialDate;
      const startNow = Date.now() + 10;
      const job = schedule.scheduleJob(startNow, () => {
        console.log("starting job");
        sendMessageCampaign(jobQueue);
      });
      alljobs.push({ id: jobQueue.id, job });
    })
  );
};

export const startJob = (campaign: Campaign): void => {
  const date = campaign.inicialDate;
  const job = schedule.scheduleJob(date, () => {
    sendMessageCampaign(campaign);
  });
  alljobs.push({ id: campaign.id, job });
};
