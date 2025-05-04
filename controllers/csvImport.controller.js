import csv from "csvtojson";
import MenuHours from "../models/menuHours.model.js";
import StoreStatus from "../models/storeStatus.model.js";
import Timezone from "../models/timezone.model.js";

export const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { collectionName } = req.body;
    const csvString = req.file.buffer.toString("utf-8");
    const jsonArray = await csv().fromString(csvString);

    let transformedArray;

    switch (collectionName) {
      case "menu_hours":
        // Assuming no transformation needed here
        await MenuHours.insertMany(jsonArray);
        break;

      case "store_status":
        transformedArray = jsonArray.map(entry => ({
          store_id: entry.store_id,
          status: entry.status,
          timestamp_utc: new Date(entry.timestamp_utc)
        }));
        await StoreStatus.insertMany(transformedArray);
        break;

      case "timezones":
        transformedArray = jsonArray.map(entry => ({
          store_id: entry.store_id,
          timezone_str: entry.timezone_str
        }));
        await Timezone.insertMany(transformedArray);
        break;

      default:
        return res.status(400).json({ message: "Invalid collection name" });
    }

    res.status(201).json({ message: `${collectionName} imported successfully` });
  } catch (error) {
    next(error);
  }
};
