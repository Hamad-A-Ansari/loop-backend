import Report from '../models/report.model.js';
import { triggerReportGeneration } from '../utils/reportGenerator.js';
import path from 'path';
import fs from 'fs';

export const triggerReport = async (req, res, next) => {
  try {
    const { store_id } = req.body;

    const reportId = await triggerReportGeneration(store_id);
    return res.status(202).json({ report_id: reportId, status: 'Running' });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const { report_id } = req.query;

    if (!report_id) {
      return res.status(400).json({ message: 'Missing required query parameter: report_id' });
    }

    const report = await Report.findOne({ report_id });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status === 'Running') {
      return res.status(200).json({ status: 'Running' });
    }

    const filePath = path.resolve(report.csvPath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Generated report file not found on server' });
    }

    return res.download(filePath, `report_${report_id}.csv`);
  } catch (error) {
    next(error);
  }
};
