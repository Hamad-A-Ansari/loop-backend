import mongoose from "mongoose";

/**
 * Filename: menuHours.model.js
 * Description: Mongoose schema for storing each store's daily business hours.
 * 
 * Fields:
 * - store_id (String): Store's unique identifier.
 * - dayOfWeek (String): Day of the week in the form of number(e.g., "Monday" -> 2, "Tuesday" -> 3).
 * - start_time_local (String): Local start time of business hours.
 * - end_time_local (String): Local end time of business hours.
 * 
 * Purpose:
 * - Used to determine the relevant time windows to calculate uptime/downtime.
 */


const menuHoursSchema = new mongoose.Schema({
  store_id: { 
    type: String, 
    required: true 
  },
  dayOfWeek: { 
    type: Number, 
    required: true 
  }, // 0-6
  start_time_local: { 
    type: String, 
    required: true 
  }, // Format: 00:00:00
  end_time_local: { 
    type: String, 
    required: true 
  },   // Format: 00:00:00
}, { timestamps: true });

const MenuHours = mongoose.model("MenuHours", menuHoursSchema);
export default MenuHours;
