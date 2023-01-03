import AppError from "../../errors/AppError";
import Departament from "../../models/Departament";

const ShowDepartamentService = async (
  id: number | string
): Promise<Departament> => {
  const departament = await Departament.findByPk(id);

  if (!departament) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return departament;
};

export default ShowDepartamentService;
