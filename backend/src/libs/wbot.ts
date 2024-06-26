import qrCode from "qrcode-terminal";
import { Client, LocalAuth, DefaultOptions } from "whatsapp-web.js";
import path from "path";
import { rm } from "fs/promises";
import { getIO } from "./socket";
import Settings from "../models/Setting";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

export interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

const fiveMinutes = 5 * 60 * 1000;
const fifteenMinutes = 15 * 60 * 1000;

const syncUnreadMessages = async (wbot: Session) => {
  const Settingdb = await Settings.findOne({
    where: { key: "CheckMsgIsGroup" }
  });

  if (Settingdb?.value !== "enabled") {
    const chats = await wbot.getChats();
    for (const chat of chats) {
      if (!chat.isGroup && chat.unreadCount > 0) {
        try {
          const unreadMessages = await chat.fetchMessages({
            limit: chat.unreadCount
          });
          for await (const msg of unreadMessages) {
            await handleMessage(msg, wbot);
          }
        } catch (error) {
          console.error(
            `Error processing messages in chat ${chat.id}: ${error.message}`
          );
        }
      }
    }
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      logger.level = "trace";
      const io = getIO();
      const sessionName = whatsapp.name;
      let sessionCfg;
      if (whatsapp && whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }

      let qrcodeTimeoutId: NodeJS.Timeout;
      let timeoutId: NodeJS.Timeout;

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({ clientId: `bd_${whatsapp.id}` }),
        puppeteer: {
          timeout: fiveMinutes,
          args: [
            "--autoplay-policy=user-gesture-required",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-component-update",
            "--disable-default-apps",
            "--disable-dev-shm-usage",
            "--disable-domain-reliability",
            "--disable-extensions",
            "--disable-features=AudioServiceOutOfProcess",
            "--disable-gpu",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-notifications",
            "--disable-offer-store-unmasked-wallet-cards",
            "--disable-popup-blocking",
            "--disable-print-preview",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-setuid-sandbox",
            "--disable-speech-api",
            "--disable-sync",
            "--hide-scrollbars",
            "--ignore-gpu-blacklist",
            "--metrics-recording-only",
            "--mute-audio",
            "--no-default-browser-check",
            "--no-first-run",
            "--no-pings",
            "--no-sandbox",
            "--no-zygote",
            "--password-store=basic",
            "--use-gl=swiftshader",
            "--use-mock-keychain",
            `--user-agent=${DefaultOptions.userAgent}`
          ],
          executablePath: process.env.CHROME_BIN || undefined
        }
      });
      wbot.id = whatsapp.id;

      timeoutId = setTimeout(async () => {
        await wbot.destroy();
        await removeWbot(whatsapp.id);
        StartWhatsAppSession(whatsapp);
      }, fifteenMinutes);

      wbot.initialize();

      wbot.on("qr", async qr => {
        clearTimeout(timeoutId);

        qrcodeTimeoutId = setTimeout(async () => {
          await wbot.destroy();
          await removeWbot(whatsapp.id);

          await whatsapp.update({
            status: "DISCONNECTED",
            session: "",
            qrcode: null,
            retries: 0
          });

          io.emit("whatsappSession", {
            action: "update",
            session: whatsapp
          });

          clearTimeout(qrcodeTimeoutId);
        }, fiveMinutes);

        if (
          whatsapp.status === "CONNECTED" ||
          whatsapp.status === "DISCONNECTED"
        )
          return;

        logger.info("Session:", sessionName);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);

        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
      });

      wbot.on("auth_failure", async msg => {
        console.error(
          `Session: ${sessionName} AUTHENTICATION FAILURE! Reason: ${msg}`
        );

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        clearTimeout(qrcodeTimeoutId);
        logger.info(`Session: ${sessionName} READY`);

        console.log("WbotON", wbot.info.wid._serialized.split("@")[0]);

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot.info.wid._serialized.split("@")[0]
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        wbot.sendPresenceAvailable();
        await syncUnreadMessages(wbot);

        clearTimeout(timeoutId);
        resolve(wbot);
      });
    } catch (err: any) {
      logger.error(err);
    }
  });
};

export const getWbot = async (whatsappId: number): Promise<Session> => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (whatsappId: number): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err: any) {
    logger.error(err);
  }
};

export const deleteSession = async (id: number | string): Promise<void> => {
  const pathRoot = path.resolve(__dirname, "..", "..", ".wwebjs_auth");
  const pathSession = `${pathRoot}/session-bd_${id}`;
  try {
    await rm(pathSession, { recursive: true, force: true });
  } catch (error) {
    logger.info(`DeleteSession:: ${pathSession}`);
    logger.error(error);
  }
};
