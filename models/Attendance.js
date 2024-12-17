const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: Date, required: true },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  status: { type: String }, // Present, Late, Short Leave
  isShortLeave: { type: Boolean, default: false }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
