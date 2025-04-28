import { v4 as uuidv4 } from 'uuid';
import { Parser } from 'json2csv';
import fs from 'fs';
import MenuHours from '../models/menuHours.model.js';
import StoreStatus from '../models/storeStatus.model.js';
import Timezone from '../models/timezone.model.js';
import Report from '../models/report.model.js';

const generateCSVReport = async (reportId) => {
  try {
    // Fetch all stores
    const stores = await StoreStatus.distinct('store_id');
    
    const reportData = [];

    for (const storeId of stores) {
      // Get timezone or default
      const timezoneData = await Timezone.findOne({ store_id: storeId });
      const timezone = timezoneData ? timezoneData.timezone_str : 'America/Chicago';

      // Fetch store status data (all)
      const statusData = await StoreStatus.find({ store_id: storeId }).sort({ timestamp_utc: 1 });

      // Hardcode current time as max timestamp
      const currentTimeUTC = statusData[statusData.length - 1]?.timestamp_utc;

      // Calculate uptime/downtime logic (simplified for now)
      const uptimeLastHour = 30;   // placeholder
      const downtimeLastHour = 30; // placeholder
      const uptimeLastDay = 5;     // placeholder
      const downtimeLastDay = 3;   // placeholder
      const uptimeLastWeek = 30;   // placeholder
      const downtimeLastWeek = 5;  // placeholder

      reportData.push({
        store_id: storeId,
        uptime_last_hour: uptimeLastHour,
        uptime_last_day: uptimeLastDay,
        uptime_last_week: uptimeLastWeek,
        downtime_last_hour: downtimeLastHour,
        downtime_last_day: downtimeLastDay,
        downtime_last_week: downtimeLastWeek
      });
    }

    // Generate CSV
    const fields = [
      'store_id',
      'uptime_last_hour',
      'uptime_last_day',
      'uptime_last_week',
      'downtime_last_hour',
      'downtime_last_day',
      'downtime_last_week'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(reportData);

    // Create reports directory if it doesn't exist
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }

    const filePath = `./generated/report_${reportId}.csv`;
    fs.writeFileSync(filePath, csv);

    // Update report status and save CSV path
    await Report.findOneAndUpdate(
      { report_id: reportId },
      { status: 'Complete', csvPath: filePath }
    );
  } catch (error) {
    console.error('Error generating report:', error);
  }
};

export const triggerReportGeneration = async () => {
  const reportId = uuidv4();

  // Create new report with "Running" status
  await Report.create({ report_id: reportId, status: 'Running' });

  // Generate report asynchronously (non-blocking)
  generateCSVReport(reportId);

  return reportId;
};
