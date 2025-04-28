import Report from '../models/report.model.js';
import { triggerReportGeneration } from '../utils/reportGenerator.js';
import path from 'path';

export const triggerReport = async (req, res, next) => {
  try {
    const reportId = await triggerReportGeneration();
    res.status(202).json({ report_id: reportId, status: 'Running' });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const { report_id } = req.query;
    const report = await Report.findOne({ report_id });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status === 'Running') {
      return res.status(200).json({ status: 'Running' });
    }

    // If complete, send CSV file
    const filePath = path.resolve(report.csvPath);
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};
