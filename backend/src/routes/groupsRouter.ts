import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as GroupsController from "../controllers/GroupsController";

const groupsRoutes = express.Router();
const upload = multer(uploadConfig);

groupsRoutes.post(
  "/groups",
  isAuth,
  upload.array("medias"),
  GroupsController.store
);

groupsRoutes.post(
  "/groups/addParticipants",
  isAuth,
  GroupsController.addParticipantsToGroup
);

groupsRoutes.post(
  "/groups/participants",
  isAuth,
  GroupsController.getAllParticipants
);

groupsRoutes.post(
  "/groups/removeParticipant",
  isAuth,
  GroupsController.removeParticipant
);

groupsRoutes.put("/groups/editGroup", isAuth, GroupsController.editGroup);

export default groupsRoutes;
