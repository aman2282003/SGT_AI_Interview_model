const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  techStack: { type: String, required: true },
  transcript: {
    type: String,
    required: true
  },
  cameraVideoUrl: {
    type: String
  },
  screenVideoUrl: {
    type: String
  },
  aiMarks: {
    type: Number,
    default: null
  }, // e.g., out of 100
  aiFeedback: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
