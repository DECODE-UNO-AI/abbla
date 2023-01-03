import { Request, Response } from "express";
// import AppError from "../errors/AppError";
import CreateDepartamentService from "../services/DepartamentServices/CreateDepartamentService";
import DeleteDepartamentService from "../services/DepartamentServices/DeleteDepartamentService";
import ListDepartamentsService from "../services/DepartamentServices/ListDepartamentsService";
import ShowDepartamentService from "../services/DepartamentServices/ShowDepartamentService";
import UpdateDepartamentService from "../services/DepartamentServices/UpdateDepartamentService";

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

  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  const departament = await CreateDepartamentService({
    name,
    description,
    queueIds
  });

  return res.status(200).json(departament);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const departament = await ShowDepartamentService(id);

  return res.status(200).json(departament);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const userData = req.body;

  const queue = await UpdateDepartamentService({ id, userData });

  return res.status(201).json(queue);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  await DeleteDepartamentService(id);

  return res.status(200).json({ message: "Departament deleted" });
};
