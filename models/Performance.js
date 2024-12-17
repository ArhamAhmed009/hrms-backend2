const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  review: {
    type: String,
    default: ''
  },
  reviewer: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'In Progress'
  },
  history: [
    {
      date: { type: Date, required: true },
      overallScore: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Performance', PerformanceSchema);
