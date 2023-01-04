import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as DepartamentControler from "../controllers/DepartamentController";

const departamentRoutes = Router();

departamentRoutes.get("/departament", DepartamentControler.index);

departamentRoutes.get("/departament/:id", DepartamentControler.show);

departamentRoutes.post("/departament", DepartamentControler.store);

departamentRoutes.put("/departament/:id", DepartamentControler.update);

departamentRoutes.delete("/departament/:id", DepartamentControler.remove);

export default departamentRoutes;
