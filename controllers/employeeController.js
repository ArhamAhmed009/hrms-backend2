const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employees' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      position,
      availability,
      hireDate,
      designation,
      department,
      phoneNumber,
      role = "Employee", // Default role if not provided
    } = req.body;
    const email = `${employeeId}@gmail.com`;
    const password = Math.random().toString(36).slice(-8);

    console.log(`Generated plaintext password: ${password}`);

    const employee = new Employee({
      employeeId,
      name,
      position,
      availability,
      hireDate,
      email,
      password, // Set plaintext password to be hashed by pre-save hook
      designation,
      department,
      phoneNumber,
      role,
    });

    await employee.save();

    res.status(201).json({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      password: password, // Plain password for verification
      role: employee.role,
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Error creating employee' });
  }
};





// Update an employee's availability
exports.updateEmployeeAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    const employee = await Employee.findByIdAndUpdate(id, { availability }, { new: true });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Error updating employee availability' });
  }
};

// Get all available employees (for manual selection)
exports.getAvailableEmployees = async (req, res) => {
  try {
    const availableEmployees = await Employee.find({ availability: 'Available' });
    res.status(200).json(availableEmployees);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching available employees' });
  }
};
