import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as MacroController from "../controllers/MacroController";

const macroRoutes = express.Router();
const upload = multer(uploadConfig);

macroRoutes.post(
  "/macros",
  isAuth,
  upload.array("medias"),
  MacroController.store
);

macroRoutes.get("/macros", isAuth, MacroController.getAllMacros);

export default macroRoutes;
