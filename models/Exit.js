const mongoose = require('mongoose');

const exitSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  exitType: { type: String, enum: ['Resignation', 'Retirement', 'Dismissal'], required: true },
  exitDate: { type: Date, required: true },
  reason: { type: String },
  remainingSalary: { type: Number, default: 0 },
  providentFund: { type: Number, default: 0 },
  resignationFile: { type: String }, // URL or path of the uploaded resignation file
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, // New field for approval status
}, { timestamps: true });

module.exports = mongoose.model('Exit', exitSchema);
