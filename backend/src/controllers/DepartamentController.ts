import { Request, Response } from "express";
import CreateDepartamentService from "../services/DepartamentServices/CreateDepartamentService";

export const index = async (
  req: Request,
  res: Response
): Promise<Response> => {};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    description,
    queueIds
  }: { name: string; description: string; queueIds: number[] } = req.body;

  const departament = await CreateDepartamentService({
    name,
    description,
    queueIds
  });

  return res.status(200).json(departament);
};
