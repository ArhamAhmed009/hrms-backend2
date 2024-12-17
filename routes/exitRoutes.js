const express = require('express');
const router = express.Router();
const exitController = require('../controllers/exitController');

// Route to process employee exit
router.post('/process-exit', exitController.processEmployeeExit);

// Route to generate exit report
router.get('/report/:id', exitController.generateExitReport);

router.get('/', exitController.getAllExits);


router.patch('/:id/approve', exitController.approveExit); // Add this line


module.exports = router;
