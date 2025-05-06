import mongoose from "mongoose";

/**
 * Filename: storeStatus.model.js
 * Description: Mongoose schema for storing timestamped status updates of stores.
 * 
 * Fields:
 * - store_id (String): Unique identifier for the store.
 * - status (String): Status of the store at a given time (e.g., "active", "inactive").
 * - timestamp_utc (Date): UTC timestamp of the status update.
 * 
 * Purpose:
 * - Used to track uptime/downtime periods for individual stores over time.
 */


const storeStatusSchema = new mongoose.Schema({
  store_id: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true 
  }, // active/inactive
  timestamp_utc: { 
    type: Date, 
    required: true }, // Date in UTC as String
}, { timestamps: true });

const StoreStatus = mongoose.model("StoreStatus", storeStatusSchema);
export default StoreStatus;
