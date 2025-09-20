import RedisStore from "rate-limit-redis";
import { rateLimit } from "express-rate-limit";
import initRedisClient from "./redisClient";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  ipv6Subnet: 56,
  store: new RedisStore({
    sendCommand: async(...args: string[]) => {
      const redisClient = await initRedisClient();
      return redisClient.sendCommand(args);
    },
  }),
});
