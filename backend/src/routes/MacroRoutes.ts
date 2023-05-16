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

macroRoutes.get("/macros/shortcut", isAuth, MacroController.index);

macroRoutes.get("/macros/:macroId", isAuth, MacroController.getMacroById);

macroRoutes.put(
  "/macros/:macroId",
  isAuth,
  upload.array("medias"),
  MacroController.update
);

macroRoutes.delete("/macros/:macroId", isAuth, MacroController.deleteMacro);

export default macroRoutes;
