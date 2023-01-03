import { Request, Response } from "express";

export const index = async (req: Request, res: Response): Promise<Response> => {
  return
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, description } = req.body

}
