const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Create Loan Request
router.post('/create', loanController.createLoanRequest);

// Approve Loan
router.put('/approve/:loanId', loanController.approveLoan);

// Deduct Loan Installment
router.put('/deduct/:employeeId', loanController.deductLoanInstallment);

router.get('/all-loan-requests', loanController.getAllLoanRequests);

// Fetch loan requests for a specific employee
router.get('/employee/:employeeId', loanController.getEmployeeLoanRequests);



module.exports = router;
