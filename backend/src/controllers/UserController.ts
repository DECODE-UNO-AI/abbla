import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import ListDepartamentsUsersService from "../services/UserServices/ListDepartamentsUsersService";
import User from "../models/User";
import Queue from "../models/Queue";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { user } = req;

  if (user.profile === "supervisor") {
    const currentUser = await User.findByPk(user.id, {
      include: [
        {
          model: Queue,
          as: "queues"
        }
      ]
    });
    const userQueues = currentUser?.queues.map(dep => dep.id) || [];
    const { users, count, hasMore } = await ListDepartamentsUsersService({
      searchParam,
      pageNumber,
      userQueues
    });
    return res.json({ users, count, hasMore });
  }

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { users } = await ListUsersService({});

  if (users.length >= Number(process.env.USER_LIMIT)) {
    throw new AppError("ERR_USER_CREATION_COUNT", 403);
  }

  const {
    email,
    password,
    name,
    profile,
    queueIds,
    whatsappId,
    startWork,
    endWork,
    notificationSound,
    departamentIds,
    whatsappNumber
  } = req.body;

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (whatsappNumber && whatsappNumber !== "") {
    await CheckIsValidContact(whatsappNumber);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    queueIds,
    whatsappId,
    startWork,
    endWork,
    notificationSound,
    departamentIds,
    whatsappNumber
  });

  const io = getIO();
  io.emit("user", {
    action: "create",
    user
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await ShowUserService(userId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  const newUserId = userId.toString();
  const sessionUserId = req.user.id.toString();

  if (req.user.profile !== "admin" && sessionUserId !== newUserId) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const userData = req.body;

  if (userData.whatsappNumber && userData.whatsappNumber !== "") {
    await CheckIsValidContact(userData.whatsappNumber);
  }

  const user = await UpdateUserService({ userData, userId });

  const io = getIO();
  io.emit("user", {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId);

  const io = getIO();
  io.emit("user", {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};
