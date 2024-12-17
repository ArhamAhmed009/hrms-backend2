const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route to mark attendance (check-in)
router.post('/mark-attendance', attendanceController.markAttendance);

// Route to mark check-out
router.post('/mark-checkout', attendanceController.markCheckOut);

module.exports = router;
