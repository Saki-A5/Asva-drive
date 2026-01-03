import { ConnectionOptions } from "bullmq";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is missing");
}

export const redisConnection: ConnectionOptions = {
  url: process.env.REDIS_URL,
  maxRetriesPerRequest: null, // REQUIRED by BullMQ
};
