const express = require('express');
const { scheduleInterview, getAllInterviews } = require('../controllers/interviewController'); // Import both controller methods
const router = express.Router();

// Route to schedule an interview
router.post('/', scheduleInterview);

// Route to get all interviews
router.get('/', getAllInterviews);  // Add this line to handle GET requests for fetching interviews

module.exports = router;
