const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EmployeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  position: String,
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'On Leave'],
    default: 'Available',
  },
  hireDate: Date,
  email: String,
  password: String, // Hashed password
  designation: String,
  department: String,
  phoneNumber: String,
  role: {
    type: String,
    enum: ['Employee', 'HR Manager', 'Project Manager'],
    default: 'Employee', // Default role is "Employee"
  },
  leaveBalance: {
    type: Number,
    default: 20, // Default leave balance for every new employee
  },
});

// Hash the password before saving
EmployeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
