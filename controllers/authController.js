const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

// loginEmployee function in your controller
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: employee._id }, 'myTemporarySecretKey', { expiresIn: '1h' });
    res.status(200).json({ token, employee: { ...employee.toObject(), role: employee.role } });
  } catch (error) {
    console.error('Error logging in employee:', error);
    res.status(500).json({ error: 'Error logging in employee' });
  }
};

