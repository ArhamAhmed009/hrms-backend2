  const express = require('express');
  const connectDB = require('./config/db');
  const cors = require('cors');

  const app = express();

  // Connect to the database
  connectDB();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/employees', require('./routes/employees'));
  app.use('/api/salaries', require('./routes/salaries'));
  app.use('/api/interviews', require('./routes/interviews'));
  app.use('/api/auth', require('./routes/auth')); // Add this line for authentication routes
  app.use('/api/candidates', require('./routes/candidates'));
  app.use('/api/timesheets', require('./routes/timeSheetRoutes'));
  app.use('/api/attendance', require('./routes/attendanceRoutes'));
  app.use('/api/leaves', require('./routes/leaveRoutes')); // Add leave routes here
  app.use('/api/performance', require('./routes/performance')); // Add performance routes
  app.use('/api/exits', require('./routes/exitRoutes')); // Add exit routes here
  app.use('/api/evaluations', require('./routes/evaluationRoutes')); // Add evaluation routes
  app.use('/api/loans', require('./routes/loanRoutes')); // Add 

  



  // Root route
  app.get('/', (req, res) => {
    res.send('Welcome to the HRMS API');
  });

  module.exports = app;
