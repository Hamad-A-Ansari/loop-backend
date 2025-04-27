import mongoose from "mongoose";

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
