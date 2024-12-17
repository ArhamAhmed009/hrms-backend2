    const express = require('express');
    const router = express.Router();
    const leaveController = require('../controllers/leaveController');

    // Employee requests leave
    router.post('/request', leaveController.requestLeave);

    // HR fetches leave requests (optional filter by status)
    router.get('/requests', leaveController.getLeaveRequests);

    // HR approves or rejects a leave request
// HR approves or rejects a specific leave request
router.put('/requests/:employeeId/:leaveId/status', leaveController.updateLeaveStatus);

    // Get leave requests for a specific employee
    router.get('/requests/:employeeId', leaveController.getEmployeeLeaves);

    module.exports = router;
