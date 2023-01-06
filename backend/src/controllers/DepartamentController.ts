import { Request, Response } from "express";
import { Op } from "sequelize";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import CreateDepartamentService from "../services/DepartamentServices/CreateDepartamentService";
import DeleteDepartamentService from "../services/DepartamentServices/DeleteDepartamentService";
import ListDepartamentsService from "../services/DepartamentServices/ListDepartamentsService";
import ShowDepartamentService from "../services/DepartamentServices/ShowDepartamentService";
import UpdateDepartamentService from "../services/DepartamentServices/UpdateDepartamentService";
import User from "../models/User";
import Departament from "../models/Departament";
import Queue from "../models/Queue";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const departaments = await ListDepartamentsService();
  return res.status(200).json(departaments);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    queueIds
  }: { name: string; description: string; queueIds: number[] } = req.body;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const departament = await CreateDepartamentService({
    name,
    description,
    queueIds
  });

  const io = getIO();
  io.emit("departament", {
    action: "create",
    departament
  });

  return res.status(200).json(departament);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const departament = await ShowDepartamentService(id);

  return res.status(200).json(departament);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const userData = req.body;

  const departament = await UpdateDepartamentService({ id, userData });

  const users = await User.findAll({
    include: [
      {
        model: Departament,
        as: "departaments",
        include: [
          {
            model: Queue,
            as: "queues"
          }
        ]
      }
    ],
    where: {
      "$departaments.id$": departament.id
    }
  });

  if (users && users.length > 0) {
    users.forEach(async user => {
      let newQueues: number[] = [];
      user.departaments.forEach(dep => {
        const queueIds = dep.queues.map(queue => queue.id);
        newQueues = [...newQueues, ...queueIds];
      });
      await user.$set("queues", newQueues);
    });
  }

  const io = getIO();
  io.emit("departament", {
    action: "update",
    departament
  });

  return res.status(201).json(departament);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteDepartamentService(id);

  const io = getIO();
  io.emit("departament", {
    action: "delete",
    departamentId: +id
  });

  return res.status(200).json({ message: "Departament deleted" });
};
