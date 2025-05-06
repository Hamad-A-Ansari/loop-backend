import mongoose from "mongoose";

/**
 * Filename: timezone.model.js
 * Description: Mongoose schema to store the timezone associated with each store.
 * 
 * Fields:
 * - store_id (String): Unique identifier of the store.
 * - timezone_str (String): IANA-compliant timezone string (e.g., "America/Denver").
 * 
 * Purpose:
 * - Required to correctly convert store-local times to UTC during report generation.
 */


const timezoneSchema = new mongoose.Schema({
  store_id: { 
    type: String, 
    required: true 
  },
  timezone_str: { 
    type: String, 
    required: true 
  },
}, { timestamps: true });

const Timezone = mongoose.model("Timezone", timezoneSchema);
export default Timezone;
