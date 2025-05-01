import express from 'express';
import { triggerReport, getReport } from '../controllers/report.controller.js';

const reportRouter = express.Router();

reportRouter.post('/trigger_report', triggerReport);
reportRouter.get('/get_report', getReport);



export default reportRouter;
