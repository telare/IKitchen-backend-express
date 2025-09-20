/* eslint-disable no-console */
import { createClient, RedisClientType } from "redis";

const host: string | undefined = process.env["REDIS_HOST"];
if (!host) throw new Error("Unexpected redis host endpoint");

const port: string | undefined = process.env["REDIS_HOST_PORT"];
if (!port) throw new Error("Unexpected redis host port");
const portNumber: number = Number(port);

let redisClient: RedisClientType | undefined;

export default async function initRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host,
        port: portNumber,
      },
    });
    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
    redisClient.on("connect", () => {
      console.log("Redis redisClient connected");
    });
    redisClient.on("ready", () =>
      console.log("Redis redisClient is ready to take messages")
    );
    redisClient.on("end", () => {
      console.log("Redis redisClient connection ended");
    });
    redisClient.on("reconnecting", () =>
      console.log("Redis redisClient is reconneting...")
    );
    await redisClient.connect();
  }
  return redisClient;
}

// export function getRedisClient() {
//   if (redisClient) return redisClient;
// }
