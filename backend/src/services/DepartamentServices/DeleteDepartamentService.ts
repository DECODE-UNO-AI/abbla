import AppError from "../../errors/AppError";
import Departament from "../../models/Departament";

const DeleteDepartamentService = async (
  departamentId: string
): Promise<void> => {
  const departament = await Departament.findByPk(departamentId);

  if (!departament) {
    throw new AppError("ERR_NO_DEPARTAMENT_FOUND", 404);
  }

  await departament.destroy();
};

export default DeleteDepartamentService;
