import express from "express";
import isAuth from "../middleware/isAuth";

import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);

whatsappRoutes.post("/whatsappapi/", WhatsAppController.storeapi);

whatsappRoutes.get("/whatsappapi", WhatsAppController.showApis)

whatsappRoutes.get("/whatsappapi/:apiId", WhatsAppController.showApi)

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);

whatsappRoutes.put("/whatsappapi/:sessionId", WhatsAppController.updateapi);

whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  WhatsAppController.remove
);

whatsappRoutes.delete(
  "/whatsappapi/:apiId",
  isAuth,
  WhatsAppController.removeapi
);


export default whatsappRoutes;
