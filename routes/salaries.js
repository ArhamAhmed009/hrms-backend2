  const express = require('express');
  const {
    getAllSalaries,
    getSalaryByEmployeeId,
    createSalary,
    updateSalary,
    generateSalarySlip, // Make sure this is defined in salaryController.js
    getAllowancesByEmployeeId,
    getDeductionsByEmployeeId,
    getAllSalariesByEmployeeId
  } = require('../controllers/salaryController'); // Ensure correct path to salaryController

  const router = express.Router();

  router.get('/', getAllSalaries); // Ensure function exists
  router.get('/employee/:employeeId', getSalaryByEmployeeId);
  router.post('/', createSalary); // Ensure function exists
  router.put('/:id', updateSalary); // Ensure function exists
  router.get('/:id/salary-slip', generateSalarySlip); // Ensure function exists
  router.get('/employee/:employeeId/allowances', getAllowancesByEmployeeId); // New route for fetching allowances by employeeId
  router.get('/employee/:employeeId/deductions', getDeductionsByEmployeeId);
  router.get('/employee/:employeeId/salaries', getAllSalariesByEmployeeId);



  module.exports = router;
