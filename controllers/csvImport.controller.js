import csv from "csvtojson";
import MenuHours from "../models/menuHours.model.js";
import StoreStatus from "../models/storeStatus.model.js";
import Timezone from "../models/timezone.model.js";

export const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { collectionName } = req.body; // Pass collection name in body
    const csvString = req.file.buffer.toString("utf-8");
    const jsonArray = await csv().fromString(csvString);

    if (collectionName === "menu_hours") {
      await MenuHours.insertMany(jsonArray);
    } else if (collectionName === "store_status") {
      await StoreStatus.insertMany(jsonArray);
    } else if (collectionName === "timezones") {
      await Timezone.insertMany(jsonArray);
    } else {
      return res.status(400).json({ message: "Invalid collection name" });
    }

    res.status(201).json({ message: `${collectionName} imported successfully` });
  } catch (error) {
    next(error);
  }
};