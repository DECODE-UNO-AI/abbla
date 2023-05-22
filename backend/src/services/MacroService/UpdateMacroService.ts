import Macro from "../../models/Macro";
import GetMacroByIdService from "./GetMacroByIdService";

interface MacroData {
  name: string;
  message1: string[];
  userId: string;
  id?: string;
  shortcut?: string;
  createdAt?: string;
  updatedAt?: string;
  whatsappId?: string;
}

interface UpdateMacroServiceData {
  macroId: number | string;
  macroData: MacroData;
}

const UpdateMacroService = async ({
  macroId,
  macroData
}: UpdateMacroServiceData) => {
  try {
    const macro = await GetMacroByIdService({ macroId });

    const newMacro = await macro?.update({
      ...macroData,
      shortcut: macroData.name.toLowerCase().replace(/ /g, "_")
    });
    await newMacro?.reload();

    return newMacro;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default UpdateMacroService;
