import mongoose from 'mongoose';

/**
 * Filename: report.model.js
 * Description: Mongoose schema to store report metadata such as report status and file path.
 * 
 * Fields:
 * - report_id (String): Unique identifier for each generated report.
 * - status (String): Report generation status (e.g., "Running", "Complete").
 * - csvPath (String): Local file path where the generated CSV is stored.
 * 
 * Purpose:
 * - Tracks progress and result of asynchronous report generation.
 */


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
