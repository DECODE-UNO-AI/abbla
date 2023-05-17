import Macro from "../../models/Macro";

interface MacroData {
  name: string;
  message1: string[];
  userId: string;
}

interface Request {
  macro: MacroData;
}

const CreateMacroService = async ({ macro }: Request): Promise<Macro> => {
  try {
    const data = {
      ...macro,
      shortcut: macro.name.toLowerCase().replace(/ /g, "_")
    };

    const macroData = await Macro.create(data);

    return macroData;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default CreateMacroService;
