import express from 'express';
import { triggerReport, getReport } from '../controllers/report.controller.js';

const router = express.Router();

router.post('/trigger_report', triggerReport);
router.get('/get_report', getReport);

export default router;
