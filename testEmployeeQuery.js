const mongoose = require('mongoose');
const Employee = require('./models/Employee'); // Adjust this path as per your project structure
const connectDB = require('./config/db'); // Adjust this path as well

async function testQuery() {
  await connectDB(); // Make sure your database connection is established

  try {
    const employeeId = "E090"; // The employeeId you want to search for
    const employee = await Employee.findOne({ employeeId: employeeId });

    if (employee) {
      console.log('Employee found:', employee);
    } else {
      console.log('Employee not found');
    }
  } catch (error) {
    console.error('Error querying employee:', error);
  } finally {
    mongoose.connection.close(); // Close the connection after the test
  }
}

testQuery();
