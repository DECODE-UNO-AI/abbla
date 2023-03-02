/* eslint-disable no-restricted-syntax */
import type {
  ConnectionState,
  proto,
  SocketConfig,
  WASocket
} from "@adiwajshing/baileys";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  isJidBroadcast,
  makeCacheableSignalKeyStore
} from "@adiwajshing/baileys";
import { initStore, Store, useSession } from "@ookamiiixd/baileys-store";
import type { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { Boom } from "@hapi/boom";
import WhatsappApi from "../models/WhatsappApi";
import { logger as lg} from "../utils/logger";
import { getIO } from "./socket";

type Session = WASocket & {
  destroy: () => Promise<void>;
  store: Store;
};

const sessions = new Map<string, Session>();
const retries = new Map<string, number>();
const SSEQRGenerations = new Map<string, number>();

const RECONNECT_INTERVAL = Number(process.env.RECONNECT_INTERVAL || 0);
const MAX_RECONNECT_RETRIES = Number(process.env.MAX_RECONNECT_RETRIES || 5);
// const SSE_MAX_QR_GENERATION = Number(process.env.SSE_MAX_QR_GENERATION || 5);
const SESSION_CONFIG_ID = "session-config";

export const prisma = new PrismaClient();
export const logger: any = lg;

type createSessionOptions = {
  whatsapp: WhatsappApi;
  res?: Response;
  SSE?: boolean;
  readIncomingMessages?: boolean;
  socketConfig?: SocketConfig;
};

export async function init(): Promise<void> {
  const io = getIO()
  initStore({ prisma });
  const sessionsStored = await prisma.session.findMany({
    select: { sessionId: true, data: true },
    where: { id: { startsWith: SESSION_CONFIG_ID } }
  });

  for (const { sessionId, data } of sessionsStored) {
    const whatsapp = await WhatsappApi.findOne({ where: { sessionId }})
    if(!whatsapp) return
    await whatsapp.update({ status: "OPENING"})
    await whatsapp.reload()
    io.emit("whatsappapi-update", { action: "UPDATE_SESSION", whatsapp })
    const { readIncomingMessages, ...socketConfig } = JSON.parse(data);
    // eslint-disable-next-line no-use-before-define
    createSession({ whatsapp, readIncomingMessages, socketConfig });
  }
}

function shouldReconnect(sessionId: string) {
  let attempts = retries.get(sessionId) ?? 0;

  if (attempts < MAX_RECONNECT_RETRIES) {
    attempts += 1;
    retries.set(sessionId, attempts);
    return true;
  }
  return false;
}


export async function createSession(
  options: createSessionOptions
): Promise<void> {
  const {
    whatsapp,
    SSE = false,
    readIncomingMessages = false,
    socketConfig
  } = options;
  const io = getIO()
  const sessionId = whatsapp.sessionId;
  const configID = `${SESSION_CONFIG_ID}-${sessionId}`;
  let connectionState: Partial<ConnectionState> = { connection: "close" };

  const destroy = async (logout = true) => {
    try {
      await Promise.all([
        // eslint-disable-next-line no-use-before-define
        logout && socket.logout(),
        prisma.chat.deleteMany({ where: { sessionId } }),
        prisma.contact.deleteMany({ where: { sessionId } }),
        prisma.message.deleteMany({ where: { sessionId } }),
        prisma.groupMetadata.deleteMany({ where: { sessionId } }),
        prisma.session.deleteMany({ where: { sessionId } })
      ]);
    } catch (e) {
      logger.error(e);
    } finally {
      sessions.delete(sessionId);
    }
  };


  const handleConnectionClose = async ( whatsapp: WhatsappApi ) => {
    const code = (connectionState.lastDisconnect?.error as Boom)?.output
      ?.statusCode;
    const restartRequired = code === DisconnectReason.restartRequired;
    const doNotReconnect = !shouldReconnect(sessionId);

    if (code === DisconnectReason.loggedOut || doNotReconnect) {
      await whatsapp.update({ status: "DISCONNECTED"})
      await whatsapp.reload()
      io.emit("whatsappapi-update", { action: "UPDATE_SESSION", whatsapp })
      destroy(doNotReconnect);
      return;
    }

    if (!restartRequired) {
      logger.info("Reconneting api session");
    }
    setTimeout(
      () => createSession(options),
      restartRequired ? 0 : RECONNECT_INTERVAL
    );
  };

  const handleNormalConnectionUpdate = async () => {
    // if (connectionState.qr?.length) {
    //   if (res && !res.headersSent) {
    //     try {
    //       res.status(200).json({ qr: connectionState.qr });
    //       return;
    //     } catch (e) {
    //       logger.error(e, "An error occured during QR generation");
    //       res.status(500).json({ error: "Unable to generate QR" });
    //     }
    //   }
    //   destroy();
    // }
  };

  const handleSSEConnectionUpdate = async () => {
    let qr: string | undefined;
    if (connectionState.qr?.length) {
      try {

        // qr = await toDataURL(connectionState.qr);
        console.log(qr);
      } catch (e) {
        // logger.error(e, "An error occured during QR generation");
        console.log(e);
      }
    }

    const currentGenerations = SSEQRGenerations.get(sessionId) ?? 0;
    // if (
    //   !res ||
    //   res.writableEnded ||
    //   (qr && currentGenerations >= SSE_MAX_QR_GENERATION)
    // ) {
    //   res && !res.writableEnded && res.end();
    //   destroy();
    //   return;
    // }

    // const data = { ...connectionState, qr };
    if (qr) SSEQRGenerations.set(sessionId, currentGenerations + 1);
    // res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const handleConnectionUpdate = SSE
    ? handleSSEConnectionUpdate
    : handleNormalConnectionUpdate;
  const { state, saveCreds } = await useSession(sessionId);

  const socket = makeWASocket({
    printQRInTerminal: true,
    browser: Browsers.ubuntu("Chrome"),
    generateHighQualityLinkPreview: true,
    ...socketConfig,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    shouldIgnoreJid: jid => isJidBroadcast(jid),
    getMessage: async key => {
      const data = await prisma.message.findFirst({
        where: { remoteJid: key.remoteJid!, id: key.id!, sessionId }
      });
      return (data?.message || undefined) as proto.IMessage | undefined;
    }
  });

  const store = new Store(sessionId, socket.ev);

  sessions.set(sessionId, { ...socket, destroy, store });

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", async update => {
    connectionState = update;
    const { connection, qr } = update;
    const whatsappApi = await WhatsappApi.findOne({ where: { sessionId } });
    if (!whatsappApi) return;

    if(connection === "connecting" && !qr) {
      await whatsappApi.update({ qrcode: null, status: "OPENING" });
      await whatsappApi.reload()
      io.emit("whatsappapi-update", { action: "UPDATE_SESSION", whatsapp: whatsappApi })
      return
    }

    if(qr) {
      await whatsappApi.update({ qrcode: qr, status: "qrcode" });
      await whatsappApi.reload()
      io.emit("whatsappapi-update", { action: "UPDATE_SESSION", whatsapp: whatsappApi })
    }

    if (connection === "open") {
      retries.delete(sessionId);
      SSEQRGenerations.delete(sessionId);
      await whatsappApi.update({ qrcode: null, status: "CONNECTED" });
      await whatsappApi.reload()
      io.emit("whatsappapi-update", { action: "UPDATE_SESSION", whatsapp: whatsappApi })
    }
    if (connection === "close") handleConnectionClose(whatsappApi);
    handleConnectionUpdate();
  });

  if (readIncomingMessages) {
    socket.ev.on("messages.upsert", async m => {
      const message = m.messages[0];
      if (message.key.fromMe || m.type !== "notify") return;

      // await delay(1000);
      // await socket.readMessages([message.key]);
    });
  }

  await prisma.session.upsert({
    create: {
      id: configID,
      sessionId,
      data: JSON.stringify({ readIncomingMessages, ...socketConfig })
    },
    update: {},
    where: { sessionId_id: { id: configID, sessionId } }
  });
}

export function getSessionStatus(session: Session): string {
  const state = ["CONNECTING", "CONNECTED", "DISCONNECTING", "DISCONNECTED"];
  let status = state[(session.ws as WebSocket).readyState];
  status = session.user ? "AUTHENTICATED" : status;
  return status;
}

export function listSessions(): Array<{ id: string; status: string }> {
  return Array.from(sessions.entries()).map(([id, session]) => ({
    id,
    status: getSessionStatus(session)
  }));
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export async function deleteSession(sessionId: string): Promise<void> {
  sessions.get(sessionId)?.destroy();
}

export function sessionExists(sessionId: string): boolean {
  return sessions.has(sessionId);
}
