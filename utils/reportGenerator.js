import { v4 as uuidv4 } from 'uuid';
import { Parser } from 'json2csv';
import fs from 'fs';
import MenuHours from '../models/menuHours.model.js';
import StoreStatus from '../models/storeStatus.model.js';
import Timezone from '../models/timezone.model.js';
import Report from '../models/report.model.js';
import moment from 'moment-timezone'; // You will need this


/*
getBusinessHours ->

*/


const getBusinessHours = async (storeId, date, timezone) => {
  const menuHours = await MenuHours.find({ store_id: storeId });
  const dayName = moment(date).tz(timezone).format('dddd').toLowerCase();
  const todaysHours = menuHours.find(mh => mh.day.toLowerCase() === dayName);

  if (!todaysHours) return null;

  return {
    start: todaysHours.start_time_local,
    end: todaysHours.end_time_local
  };
};

const generateCSVReport = async (reportId) => {
  try {
    const stores = await StoreStatus.distinct('store_id');
    const reportData = [];

    for (const storeId of stores) {
      const timezoneData = await Timezone.findOne({ store_id: storeId });
      const timezone = timezoneData ? timezoneData.timezone_str : 'America/Chicago';
      
      const currentTime = moment.utc();

      // Fetch status data for last 7 days only (optimization)
      const sevenDaysAgo = moment.utc().subtract(7, 'days');
      const statusData = await StoreStatus.find({
        store_id: storeId,
        timestamp_utc: { $gte: sevenDaysAgo.toDate() }
      }).sort({ timestamp_utc: 1 });

      if (statusData.length === 0) continue;

      const lastHourStart = moment(currentTime).subtract(1, 'hours');
      const lastDayStart = moment(currentTime).subtract(1, 'days');
      const lastWeekStart = moment(currentTime).subtract(7, 'days');

      const computeUptimeDowntime = async (startTime, endTime) => {
        const statuses = statusData.filter(status => {
          const timestamp = moment.utc(status.timestamp_utc);
          return timestamp.isSameOrAfter(startTime) && timestamp.isBefore(endTime);
        });

        if (statuses.length === 0) {
          const minutes = moment.duration(endTime.diff(startTime)).asMinutes();
          return { uptime: 0, downtime: minutes };
        }

        let uptimeMinutes = 0;
        let downtimeMinutes = 0;
        let lastStatus = statuses[0].status;
        let lastTimestamp = moment.utc(statuses[0].timestamp_utc);

        for (let i = 1; i < statuses.length; i++) {
          const current = statuses[i];
          const currentTimestamp = moment.utc(current.timestamp_utc);
          const minutesBetween = moment.duration(currentTimestamp.diff(lastTimestamp)).asMinutes();

          if (lastStatus === 'active') {
            uptimeMinutes += minutesBetween;
          } else {
            downtimeMinutes += minutesBetween;
          }

          lastStatus = current.status;
          lastTimestamp = currentTimestamp;
        }

        const finalGap = moment.duration(endTime.diff(lastTimestamp)).asMinutes();
        if (lastStatus === 'active') {
          uptimeMinutes += finalGap;
        } else {
          downtimeMinutes += finalGap;
        }

        return { uptime: uptimeMinutes, downtime: downtimeMinutes };
      };

      const lastHourMetrics = await computeUptimeDowntime(lastHourStart, currentTime);
      const lastDayMetrics = await computeUptimeDowntime(lastDayStart, currentTime);
      const lastWeekMetrics = await computeUptimeDowntime(lastWeekStart, currentTime);

      reportData.push({
        store_id: storeId,
        uptime_last_hour: Math.round(lastHourMetrics.uptime),
        uptime_last_day: Math.round(lastDayMetrics.uptime / 60),
        uptime_last_week: Math.round(lastWeekMetrics.uptime / 60),
        downtime_last_hour: Math.round(lastHourMetrics.downtime),
        downtime_last_day: Math.round(lastDayMetrics.downtime / 60),
        downtime_last_week: Math.round(lastWeekMetrics.downtime / 60)
      });
    }

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

    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }

    const filePath = `./reports/report_${reportId}.csv`;
    fs.writeFileSync(filePath, csv); // overwrites if already present

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
  await Report.create({ report_id: reportId, status: 'Running' });
  generateCSVReport(reportId);
  return reportId;
};