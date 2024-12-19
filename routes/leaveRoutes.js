const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Employee requests leave
router.post('/request', leaveController.requestLeave);

// Project Manager approves or rejects a leave request
router.put('/requests/:leaveId/pm-approval', leaveController.projectManagerApproval);

// HR approves or rejects a leave request (after PM approval)
router.put('/requests/:leaveId/hr-approval', leaveController.hrApproval);

// HR fetches leave requests (filter by status or role: Project Manager or HR)
router.get('/requests', leaveController.getLeaveRequests);

// Get leave requests for a specific employee
router.get('/requests/:employeeId', leaveController.getEmployeeLeaves);

// Get leave balance for a specific employee
router.get('/balance/:employeeId', leaveController.getLeaveBalance);

router.get('/all-loan-requests', leaveController.getAllLoanRequests);


module.exports = router;
