import RedisStore from "rate-limit-redis";
import { rateLimit } from "express-rate-limit";
import initRedisClient from "./redisClient";
import { AppError } from "@shared/utils/AppError";

const windowMs = 15 * 60 * 1000;
const limit = 100;

export const limiter = rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res) => {
    const error = new AppError(429, req);
    return res.status(error.getStatus()).json(error.getError());
  },
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      const redisClient = await initRedisClient();
      return redisClient.sendCommand(args);
    },
  }),
});
