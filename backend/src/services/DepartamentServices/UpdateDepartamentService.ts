import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializedDepartament } from "../../helpers/SerializeDepartament";
import Queue from "../../models/Queue";
import ShowDepartamentService from "./ShowDepartamentService";

interface UserData {
  description?: string;
  name?: string;
  queueIds?: number[];
}

interface Request {
  userData: UserData;
  id: string | number;
}

interface Response {
  id: number;
  name: string;
  description: string;
  queues: Queue[];
}

const UpdateDepartamentService = async ({
  id,
  userData
}: Request): Promise<Response> => {
  const { name, description, queueIds = [] } = userData;

  // if (req.user.profile !== "admin" && sessionUserId !== newUserId) {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  const schema = Yup.object().shape({
    name: Yup.string(),
    description: Yup.string()
  });

  try {
    await schema.validate({ description, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const departament = await ShowDepartamentService(id);

  await departament.$set("queues", queueIds);

  await departament.reload();

  return SerializedDepartament(departament);
};

export default UpdateDepartamentService;
