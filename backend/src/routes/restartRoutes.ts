import express from "express";
import pm2 from "pm2";
import AppError from "../errors/AppError";
import isAuth from "../middleware/isAuth";

const restartRoutes = express.Router();

restartRoutes.post("/restart", isAuth, (req, res) => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  if (process.env.PM2_INDEX) {
    // eslint-disable-next-line consistent-return
    pm2.connect(err => {
      if (err) {
        throw new AppError("INTERNAL_ERROR", 500);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-shadow
      pm2.restart(process.env.PM2_INDEX!, (err, proc) => {
        if (err) {
          throw new AppError("INTERNAL_ERROR", 500);
        }
        pm2.disconnect();
      });
    });
  }
  return res.status(200).json({ message: "Restarting " });
});

export default restartRoutes;
