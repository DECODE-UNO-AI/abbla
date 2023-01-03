import Departament from "../models/Departament";
import Queue from "../models/Queue";

interface ISerializedDepartament {
  id: number;
  name: string;
  description: string;
  queues: Queue[];
}

export const SerializedDepartament = (
  departament: Departament
): ISerializedDepartament => {
  return {
    id: departament.id,
    name: departament.name,
    description: departament.description,
    queues: departament.queues
  };
};
