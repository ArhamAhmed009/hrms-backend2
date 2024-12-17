const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Create Loan Request
router.post('/create', loanController.createLoanRequest);

// Approve Loan
router.put('/approve/:loanId', loanController.approveLoan);

// Deduct Loan Installment
router.put('/deduct/:employeeId', loanController.deductLoanInstallment);

module.exports = router;
