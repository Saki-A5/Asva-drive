import Redis from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";

const isProd = process.env.NODE_ENV === "production";

const localRedis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

const upstashRedis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export const redis = isProd ? upstashRedis : localRedis;

if (!redis) {
  console.warn("Redis is not configured correctly");
}