/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* import schedule from "node-schedule";
import QueueListeners from "./campaignQueueListeners";
import * as jobs from "../jobs/Index";

const queues = Object.values(jobs).map((job: any) => (
   const job = schedule.scheduleJob()
));

export default {
  queues,
  async add(name: string, data: any | any[]) {
    const queue = this.queues.find((q: any) => q.name === name);
    if (!queue) {
      throw new Error(`Queue ${name} not exists`);
    }
    if (Array.isArray(data)) {
      const parsedJobs = data.map((jobData: any) => {
        return {
          data: jobData,
          opts: {
            ...queue.options,
            ...jobData?.options
          }
        };
      });
      return queue.bull.addBulk(parsedJobs);
    }
    return queue.bull.add(data, { ...queue.options, ...data.options });
  },
  process() {
    return this.queues.forEach(queue => {
      queue.bull.process(200, queue.handle);

      queue.bull
        .on("active", QueueListeners.onActive)
        .on("error", QueueListeners.onError)
        .on("waiting", QueueListeners.onWaiting)
        .on("completed", QueueListeners.onCompleted)
        .on("stalled", QueueListeners.onStalled)
        .on("failed", QueueListeners.onFailed)
        .on("cleaned", QueueListeners.onClean)
        .on("removed", QueueListeners.onRemoved);
    });
  }
};
 */
