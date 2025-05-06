import express from 'express';
import { triggerReport, getReport } from '../controllers/report.controller.js';

/**
 * Filename: report.routes.js
 * Description: Endpoints to trigger and fetch uptime/downtime reports.
 * 
 * Routes:
 * - POST /trigger_report: Initiates background generation of a new report.
 * - GET /get_report: Returns a generated report by report_id (CSV file).
 * 
 * Purpose:
 * - Facilitates reporting logic for store uptime analytics.
 */


const reportRouter = express.Router();

reportRouter.post('/trigger_report', triggerReport);
reportRouter.get('/get_report', getReport);



export default reportRouter;
