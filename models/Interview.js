const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  candidateId: { type: String, required: true }, // Store candidateId like C001, C002
  interviewId: { type: String, required: true },
  position: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  employerPanel: [
    {
      employeeId: { type: String, required: true },
      name: { type: String, required: true },
      position: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Interview', InterviewSchema);
