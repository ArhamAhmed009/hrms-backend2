const Employee = require('./models/Employee');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Connect to MongoDB
connectDB();

const addLeaveBalanceToEmployees = async () => {
  try {
    await Employee.updateMany({}, { $set: { leaveBalance: 20 } });
    console.log('Leave balance added to all employees');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error updating leave balance:', error);
    mongoose.connection.close();
  }
};

addLeaveBalanceToEmployees();
