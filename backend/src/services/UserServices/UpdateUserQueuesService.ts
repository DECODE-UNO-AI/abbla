import User from "../../models/User";
import Departament from "../../models/Departament";
import Queue from "../../models/Queue";

interface IDepartament {
  id: number | string;
}

const UpdateUserQueuesService = async (
  departament: IDepartament
): Promise<void> => {
  const users = await User.findAll({
    include: [
      {
        model: Departament,
        as: "departaments",
        include: [
          {
            model: Queue,
            as: "queues"
          }
        ]
      }
    ],
    where: {
      "$departaments.id$": departament.id
    }
  });

  if (users && users.length > 0) {
    users.forEach(async user => {
      let newQueues: number[] = [];
      user.departaments.forEach(dep => {
        const queueIds = dep.queues.map(queue => queue.id);
        newQueues = [...newQueues, ...queueIds];
      });
      const newQueuesUnique = [...new Set(newQueues)];
      await user.$set("queues", newQueuesUnique);
    });
  }
};

export default UpdateUserQueuesService;
