import mongoose from "mongoose";

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
