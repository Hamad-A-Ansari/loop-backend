import mongoose from "mongoose";

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
    type: String, 
    required: true }, // Date in UTC as String
}, { timestamps: true });

const StoreStatus = mongoose.model("StoreStatus", storeStatusSchema);
export default StoreStatus;
