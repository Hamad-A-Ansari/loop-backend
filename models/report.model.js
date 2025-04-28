import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  report_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['Running', 'Complete'], 
    default: 'Running' 
  },
  csvPath: { 
    type: String 
  }, // path to generated CSV
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
