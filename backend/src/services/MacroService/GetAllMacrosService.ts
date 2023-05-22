import Macro from "../../models/Macro";

const GetAllMacrosService = async (): Promise<Macro[]> => {
  try {
    const macroData = await Macro.findAll();

    return macroData;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default GetAllMacrosService;
