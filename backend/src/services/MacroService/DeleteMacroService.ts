import Macro from "../../models/Macro";

interface Request {
  macroId: number | string;
}

const DeleteMacroService = async ({ macroId }: Request) => {
  try {
    await Macro.destroy({
      where: { id: macroId }
    });

    return;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default DeleteMacroService;
