import Macro from "../../models/Macro";

interface GetMacroByIdServiceData {
  macroId: number | string;
}

const GetMacroByIdService = async ({ macroId }: GetMacroByIdServiceData) => {
  try {
    const macro = await Macro.findByPk(macroId);

    return macro;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default GetMacroByIdService;
