import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import MenuHours from '../models/menuHours.model.js';
import StoreStatus from '../models/storeStatus.model.js';
import Timezone from '../models/timezone.model.js';
import Report from '../models/report.model.js';
import moment from 'moment-timezone'; // You will need this


//switching to fast-csv for better results
import { format } from 'fast-csv';
import path from 'path';


const getBusinessHours = async (storeId, date, timezone) => {
  const menuHours = await MenuHours.find({ store_id: storeId });

  const dayName = moment(date).tz(timezone).format('dddd').toLowerCase();

  // ✅ Safe access using optional chaining
  const todaysHours = menuHours.find(
    (mh) => mh.day?.toLowerCase() === dayName
  );

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
      
      /**
       * For realtime Status
       * 
       * const latestStatus = await StoreStatus.findOne().sort({ timestamp_utc: -1 });
       * const currentTime = moment.utc(latestStatus?.timestamp_utc ||      moment.utc());

       */


      const currentTime = moment.utc("2024-10-09T05:27:39Z");

      // Fetch status data for last 7 days only (optimization)
      const sevenDaysAgo = moment.utc(currentTime).subtract(7, 'days');
      const statusData = await StoreStatus.find({
        store_id: storeId,
        timestamp_utc: { $gte: sevenDaysAgo.toDate(), $lte: currentTime.toDate() }
      }).sort({ timestamp_utc: 1 });    

      
      console.log(`[${storeId}] statuses fetched: ${statusData.length}`);

      if (statusData.length === 0) continue;

      const lastHourStart = moment(currentTime).subtract(1, 'hours');
      const lastDayStart = moment(currentTime).subtract(1, 'days');
      const lastWeekStart = moment(currentTime).subtract(7, 'days');

      const computeUptimeDowntime = async (startTime, endTime) => {
        const start = moment.utc(startTime);
        const end = moment.utc(endTime);
      
        let uptimeMinutes = 0;
        let downtimeMinutes = 0;
      
        // Break the interval into days
        const current = moment(start);
      
        while (current.isBefore(end)) {
          const date = current.clone();
          const storeLocalDate = date.clone().tz(timezone);
          const businessHours = await getBusinessHours(storeId, storeLocalDate, timezone);
      
          let dayStart, dayEnd;
          if (!businessHours) {
            // Assume 24*7
            dayStart = date.clone().startOf('day');
            dayEnd = date.clone().endOf('day');
          } else {
            dayStart = moment.tz(
              `${storeLocalDate.format('YYYY-MM-DD')} ${businessHours.start}`,
              'YYYY-MM-DD HH:mm:ss',
              timezone
            ).utc();
            dayEnd = moment.tz(
              `${storeLocalDate.format('YYYY-MM-DD')} ${businessHours.end}`,
              'YYYY-MM-DD HH:mm:ss',
              timezone
            ).utc();
          }
      
          // Clamp business hours to global interval
          const intervalStart = moment.max(dayStart, start);
          const intervalEnd = moment.min(dayEnd, end);
          if (!intervalStart.isBefore(intervalEnd)) {
            current.add(1, 'day');
            continue; // no overlap
          }
      
          // Filter statuses within this interval
          const dayStatuses = statusData.filter(status => {
            const ts = moment.utc(status.timestamp_utc);
            return ts.isSameOrAfter(intervalStart) && ts.isBefore(intervalEnd);
          });
      
          let prevStatus = null;
          let prevTime = intervalStart;
      
          // Interpolate: find latest status before intervalStart
          const earlierStatus = [...statusData]
            .reverse()
            .find(s => moment.utc(s.timestamp_utc).isBefore(intervalStart));
          prevStatus = earlierStatus ? earlierStatus.status : 'inactive';
      
          for (const status of dayStatuses) {
            const currentTime = moment.utc(status.timestamp_utc);
            const minutesBetween = moment.duration(currentTime.diff(prevTime)).asMinutes();
      
            if (prevStatus === 'active') {
              uptimeMinutes += minutesBetween;
            } else {
              downtimeMinutes += minutesBetween;
            }
      
            prevTime = currentTime;
            prevStatus = status.status;
          }
      
          // Final stretch after last known status
          const finalGap = moment.duration(intervalEnd.diff(prevTime)).asMinutes();
          if (prevStatus === 'active') {
            uptimeMinutes += finalGap;
          } else {
            downtimeMinutes += finalGap;
          }
      
          current.add(1, 'day');
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
 
    

    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }
    
    const filePath = path.join('reports', `report_${reportId}.csv`);
    const ws = fs.createWriteStream(filePath);
    const csvStream = format({ headers: true });
    
    csvStream.pipe(ws);
    
    for (const row of reportData) {
      csvStream.write(row);
    }
    
    csvStream.end();
    
    ws.on('finish', async () => {
      await Report.findOneAndUpdate(
        { report_id: reportId },
        { status: 'Complete', csvPath: filePath }
      );
    });
    

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