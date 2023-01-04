import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as DepartamentControler from "../controllers/DepartamentController";

const departamentRoutes = Router();

departamentRoutes.get("/departament", isAuth, DepartamentControler.index);

departamentRoutes.get("/departament/:id", isAuth, DepartamentControler.show);

departamentRoutes.post("/departament", isAuth, DepartamentControler.store);

departamentRoutes.put("/departament/:id", isAuth, DepartamentControler.update);

departamentRoutes.delete(
  "/departament/:id",
  isAuth,
  DepartamentControler.remove
);

export default departamentRoutes;
