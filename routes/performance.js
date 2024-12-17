const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// Routes
router.post('/', performanceController.addPerformance); // Add new performance goal
router.get('/:employeeId', performanceController.getPerformanceByEmployee); // Get performance by employee
router.put('/:employeeId/progress', performanceController.updatePerformanceProgress);
router.put('/:employeeId/review', performanceController.reviewPerformance); // Submit review
// Change this:
router.put('/:employeeId/overall-score', performanceController.calculateOverallScore);

// To this if you want to use POST:
router.post('/:employeeId/overall-score', performanceController.calculateOverallScore);
router.get('/:employeeId/history', performanceController.getPerformanceHistory); // Fetch performance history
router.post('/:employeeId/history', performanceController.addPerformanceHistory);

module.exports = router;
