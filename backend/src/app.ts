import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";
import { startJobs } from "./libs/campaignQueue";
import { startAllScheduledMessagesJobs } from "./libs/scheduledMessageQueue";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("events").EventEmitter.defaultMaxListeners = Infinity;

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.use(
  cors({
    credentials: true,
    origin: true
    // origin:[process.env.FRONTEND_URL, "127.0.0.1:3030"]
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

// starting a campaigns
startJobs();
// stating scheduled messages
startAllScheduledMessagesJobs();

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
