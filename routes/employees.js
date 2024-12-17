// routes/employees.js
const express = require('express');
const {
  getAllEmployees,
  createEmployee,
  updateEmployeeAvailability,
  getAvailableEmployees,
  generateEmployerPanel,
} = require('../controllers/employeeController');
const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.put('/:id/availability', updateEmployeeAvailability);
router.get('/available', getAvailableEmployees);


module.exports = router;
