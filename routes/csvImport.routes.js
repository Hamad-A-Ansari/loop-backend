import express from "express";
import { upload } from "../middlewares/uploadCsv.middleware.js";
import { importCSV } from "../controllers/csvImport.controller.js";

/**
 * Filename: csvImport.routes.js
 * Description: API route for importing CSV data into MongoDB collections.
 * 
 * Routes:
 * - POST /import: Upload and process a CSV file containing data for StoreStatus, MenuHours, etc.
 * 
 * Purpose:
 * - Supports bulk importing of dataset files used in uptime/downtime calculations.
 */


const importRouter = express.Router();

importRouter.post("/import", upload.single("file"), importCSV);

export default importRouter;
