import { Queue } from "bullmq";
import { redisConnection } from "./redis-connection";

export const indexQueue = new Queue("indexing", {
  connection: redisConnection,
});

export const fileQueue = new Queue("file", {
  connection: redisConnection,
});