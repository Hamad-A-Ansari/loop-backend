import express from "express";
import { upload } from "../middlewares/uploadCsv.middleware.js";
import { importCSV } from "../controllers/csvImport.controller.js";

const importRouter = express.Router();

importRouter.post("/import", upload.single("file"), importCSV);

export default importRouter;
