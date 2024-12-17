const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  leaveType: {
    type: String, // E.g., 'Sick Leave', 'Annual Leave', 'Casual Leave'
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String, // Optional reason for the leave
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Leave', leaveSchema);
