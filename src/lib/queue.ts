import { Queue } from 'bullmq'

const redisHost = process.env.REDIS_HOST || '127.0.0.1'
const redisPort = Number(process.env.REDIS_PORT || 6379)
const redisPassword = process.env.REDIS_PASSWORD || undefined

const connection = {
  host: redisHost,
  port: redisPort,
  password: redisPassword,
}

export const indexQueue = new Queue('indexing', { connection })
export const fileQueue = new Queue('file', {connection});   // handle the deletion of files after 28 days

export { connection }
