// models/Evaluation.js
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    candidateId: { type: String, required: true }, // Use String for custom IDs if needed
    evaluatorId: { type: String, required: true },
    technicalSkills: { type: Number, required: true },
    problemSolving: { type: Number, required: true },
    behavioralFit: { type: Number, required: true },
    culturalFit: { type: Number, required: true },
    communicationSkills: { type: Number, required: true },
    adaptability: { type: Number, required: true },
    situationalJudgment: { type: Number, required: true },
    motivationInterest: { type: Number, required: true },
    overallImpression: { type: Number, required: true },
    comments: { type: String },
    finalDecision: {
      type: String,
      enum: ['Selected', 'Rejected', 'On Hold'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evaluation', evaluationSchema);
