const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  candidateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  isShortlisted: { type: Boolean, default: false },
  experience: { type: Number, required: true },
  skills: { type: [String], required: true },
  education: { type: String, required: true },
  resume: { type: String }, // Path to the uploaded resume PDF
});

module.exports = mongoose.model('Candidate', CandidateSchema);
