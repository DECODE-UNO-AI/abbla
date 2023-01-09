import Departament from "../../models/Departament";
import Queue from "../../models/Queue";

const ListDepartamentsService = async (): Promise<Departament[]> => {
  const departaments = await Departament.findAll({
    order: [["name", "ASC"]],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] }
    ]
  });

  return departaments;
};

export default ListDepartamentsService;
