import * as Yup from "yup";

import AppError from "../../errors/AppError";

import Departament from "../../models/Departament";
import Queue from "../../models/Queue";

interface Request {
  name: string;
  description: string;
  queueIds: number[];
}

interface Response {
  id: number;
  name: string;
  description: string;
  //queueId: number[];
}

const CreateDepartamentService = async ({
  name,
  description,
  queueIds = []
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    description: Yup.string().required(),
    name: Yup.string()
      .required()
      .test(
        "Check-department-name",
        "An departament with this name already exists",
        async value => {
          if (!value) return false;
          const nameExists = await Departament.findOne({
            where: { name }
          });
          return !nameExists;
        }
      )
  });

  try {
    await schema.validate({ description, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const departament = await Departament.create(
    {
      name,
      description
    },
    { include: ["queues"] }
  );

  await departament.$set("queues", queueIds);

  await departament.reload();

  return departament;
};

export default CreateDepartamentService;
