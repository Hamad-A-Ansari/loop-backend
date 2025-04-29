// utils/reportGenerator.js

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import StoreStatus from '../models/storeStatus.model.js';
import StoreHours from '../models/storeHours.model.js';
import Report from '../models/report.model.js';
import { writeReportCSV } from './csvWriter.js';

export const triggerReportGeneration = async (storeId = null) => {
  const report_id = uuidv4();
  const csvPath = path.join('reports', `report_${report_id}.csv`);

  // Save report initial state to DB
  const report = await Report.create({
    report_id,
    status: 'Running',
    csvPath
  });

  process.nextTick(async () => {
    try {
      const filters = storeId ? { store_id: storeId } : {};

      // Get max timestamp_utc to use as fixed current time
      const maxTimestamp = await StoreStatus.findOne(filters).sort({ timestamp_utc: -1 });
      const currentTime = moment.utc(maxTimestamp?.timestamp_utc);

      const allStatus = await StoreStatus.find(filters);

      const grouped = {};
      allStatus.forEach(entry => {
        const store = entry.store_id;
        if (!grouped[store]) grouped[store] = [];
        grouped[store].push(entry);
      });

      const finalReport = [];

      for (const [storeId, statuses] of Object.entries(grouped)) {
        const hours = await StoreHours.find({ store_id: storeId });
        const businessHours = mapBusinessHours(hours);

        const { uptimeLastHour, uptimeLastDay, downtimeLastHour, downtimeLastDay, uptimeLastWeek, downtimeLastWeek } =
          computeUptimeDowntime(statuses, businessHours, currentTime);

        finalReport.push({
          store_id: storeId,
          uptime_last_hour: uptimeLastHour.toFixed(2),
          uptime_last_day: uptimeLastDay.toFixed(2),
          uptime_last_week: uptimeLastWeek.toFixed(2),
          downtime_last_hour: downtimeLastHour.toFixed(2),
          downtime_last_day: downtimeLastDay.toFixed(2),
          downtime_last_week: downtimeLastWeek.toFixed(2),
        });
      }

      await writeReportCSV(csvPath, finalReport);
      await Report.findOneAndUpdate({ report_id }, { status: 'Complete' });

    } catch (err) {
      console.error('Report generation failed:', err);
      await Report.findOneAndUpdate({ report_id }, { status: 'Failed' });
    }
  });

  return report_id;
};

function mapBusinessHours(hours) {
  const map = {};
  for (const h of hours) {
    map[h.day] = { start: h.start_time_local, end: h.end_time_local };
  }
  return map;
}

function computeUptimeDowntime(statuses, businessHours, currentTime) {
  const periods = [
    { label: 'LastHour', start: moment.utc(currentTime).subtract(1, 'hour') },
    { label: 'LastDay', start: moment.utc(currentTime).subtract(1, 'day') },
    { label: 'LastWeek', start: moment.utc(currentTime).subtract(7, 'days') },
  ];

  const result = {
    uptimeLastHour: 0,
    downtimeLastHour: 0,
    uptimeLastDay: 0,
    downtimeLastDay: 0,
    uptimeLastWeek: 0,
    downtimeLastWeek: 0,
  };

  for (const { label, start } of periods) {
    const windowStatuses = statuses
      .filter(s => {
        const t = moment.utc(s.timestamp_utc);
        return t.isBetween(start, currentTime, null, '[)');
      })
      .sort((a, b) => new Date(a.timestamp_utc) - new Date(b.timestamp_utc));

    let totalUptime = 0;
    let totalDowntime = 0;

    if (windowStatuses.length === 0) continue;

    for (let i = 0; i < windowStatuses.length - 1; i++) {
      const current = windowStatuses[i];
      const next = windowStatuses[i + 1];

      const from = moment.utc(current.timestamp_utc);
      const to = moment.utc(next.timestamp_utc);

      const isOpen = isWithinBusinessHours(from, businessHours);
      if (!isOpen) continue;

      const diffMin = to.diff(from, 'minutes');

      if (current.status === 'active') totalUptime += diffMin;
      else totalDowntime += diffMin;
    }

    // Fill gap from last status to currentTime
    const last = windowStatuses[windowStatuses.length - 1];
    const lastTime = moment.utc(last.timestamp_utc);
    if (lastTime.isBefore(currentTime) && isWithinBusinessHours(lastTime, businessHours)) {
      const diffMin = currentTime.diff(lastTime, 'minutes');
      if (last.status === 'active') totalUptime += diffMin;
      else totalDowntime += diffMin;
    }

    result[`uptime${label}`] = totalUptime;
    result[`downtime${label}`] = totalDowntime;
  }

  return result;
}

function isWithinBusinessHours(time, businessHours) {
  const day = time.day();
  const dayHours = businessHours[day];
  if (!dayHours) return true; // assume 24x7 if missing

  const timeStr = time.format('HH:mm:ss');
  return timeStr >= dayHours.start && timeStr <= dayHours.end;
}