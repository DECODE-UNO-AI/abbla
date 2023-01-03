import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as DepartamentControler from "../controllers/DepartamentController";

const departamentRoutes = Router();

departamentRoutes.get("/departament", DepartamentControler.index);

departamentRoutes.post("/departament", DepartamentControler.store);

export default departamentRoutes;
