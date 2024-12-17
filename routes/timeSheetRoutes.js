const express = require('express');
const router = express.Router();
const timeSheetController = require('../controllers/timeSheetController');

// Add a new time sheet
router.post('/', timeSheetController.addTimeSheet);

// Get time sheets by employeeId
router.get('/:employeeId', timeSheetController.getTimeSheetsByEmployee);

// Update a time sheet
router.put('/:id', timeSheetController.updateTimeSheet);

// Delete a time sheet
router.delete('/:id', timeSheetController.deleteTimeSheet);

// Weekly report route
router.get('/:employeeId/weekly-report', timeSheetController.generateWeeklyReport);

// Monthly report route
router.get('/:employeeId/monthly-report', timeSheetController.generateMonthlyReport);

// Route for overall weekly hours
router.get('/overall/weekly', timeSheetController.getOverallWeeklyHours);

// Route for overall monthly hours
router.get('/overall/monthly', timeSheetController.getOverallMonthlyHours); 

router.post('/check-in', timeSheetController.checkIn);

// Check-out route (end time)
router.post('/check-out', timeSheetController.checkOut);

// Fetch all time sheets
router.get('/', timeSheetController.getAllTimeSheetsSorted);



module.exports = router;
