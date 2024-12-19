const Loan = require('../models/Loan');
const Employee = require('../models/Employee');
const Salary = require('../models/Salary');
const mongoose = require('mongoose'); // Import mongoose

// Create Loan Request
exports.createLoanRequest = async (req, res) => {
  try {
    const { employeeId, loanAmount, monthlyInstallment } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const loan = new Loan({
      employeeId: employee._id,
      loanAmount,
      monthlyInstallment,
      remainingBalance: loanAmount,
    });

    await loan.save();
    res.status(201).json({ message: 'Loan request created successfully', loan });
  } catch (error) {
    console.error('Error creating loan request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve Loan
exports.approveLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    loan.status = 'Approved';
    loan.approvedAmount = loan.loanAmount;
    loan.approvedDate = new Date();
    await loan.save();

    res.status(200).json({ message: 'Loan approved successfully', loan });
  } catch (error) {
    console.error('Error approving loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Deduct Loan Installment from Salary
exports.deductLoanInstallment = async (req, res) => {
    try {
      const { employeeId } = req.params;
  
      // Find the employee by either employeeId string or ObjectId
      const employee = await Employee.findOne({
        $or: [
          { employeeId: employeeId },
          { _id: mongoose.Types.ObjectId.isValid(employeeId) ? employeeId : null },
        ],
      });
  
      if (!employee) return res.status(404).json({ error: 'Employee not found' });
  
      // Fetch approved loan
      const loan = await Loan.findOne({ employeeId: employee._id, status: 'Approved' });
      if (!loan) return res.status(404).json({ error: 'No active loan found' });
  
      if (loan.remainingBalance <= 0) return res.status(400).json({ message: 'Loan fully repaid' });
  
      // Find or create salary record for the current month and year
      const currentDate = new Date();
      const salaryMonth = currentDate.toLocaleString('default', { month: 'long' });
      const salaryYear = currentDate.getFullYear();
  
      let salary = await Salary.findOne({ employeeId: employee._id, salaryMonth, salaryYear });
  
      if (!salary) {
        // Create a new salary record if not found
        salary = new Salary({
          employeeId: employee._id,
          baseSalary: 0, // Default value
          allowances: {},
          deductions: { loanInstallment: loan.monthlyInstallment },
          totalSalary: -loan.monthlyInstallment, // Deduction only
          salaryMonth,
          salaryYear,
        });
      } else {
        // Add loan installment to deductions
        salary.deductions.loanInstallment = loan.monthlyInstallment;
  
        // Update total salary after deduction
        const totalDeductions = Object.values(salary.deductions).reduce((acc, val) => acc + val, 0);
        salary.totalSalary = salary.baseSalary - totalDeductions;
      }
  
      // Deduct installment from loan
      loan.remainingBalance -= loan.monthlyInstallment;
      if (loan.remainingBalance <= 0) {
        loan.remainingBalance = 0;
        loan.status = 'Paid';
      }
  
      await loan.save();
      await salary.save();
  
      res.status(200).json({
        message: 'Loan installment deducted successfully',
        loan,
        salary,
      });
    } catch (error) {
      console.error('Error deducting loan installment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Get All Loan Requests
exports.getAllLoanRequests = async (req, res) => {
  try {
    // Fetch all loan records and populate the 'employeeId' field to get employee details
    const loans = await Loan.find()
      .populate('employeeId', 'employeeId name position'); // Include specific fields for employees

    // Map the response to clean up the loan data
    const formattedLoans = loans.map((loan) => ({
      _id: loan._id,
      employeeId: loan.employeeId?.employeeId || 'N/A',
      employeeName: loan.employeeId?.name || 'Unknown Employee',
      position: loan.employeeId?.position || 'N/A',
      loanAmount: loan.loanAmount,
      monthlyInstallment: loan.monthlyInstallment,
      remainingBalance: loan.remainingBalance,
      status: loan.status,
      createdAt: loan.createdAt,
      approvedDate: loan.approvedDate || null,
    }));

    res.status(200).json(formattedLoans);
  } catch (error) {
    console.error('Error fetching loan requests:', error.message);
    res.status(500).json({ error: 'Error fetching loan requests' });
  }
};

// Get Loan Requests for a Specific Employee
exports.getEmployeeLoanRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find the employee by employeeId string (e.g., "E090")
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch loan requests for the specific employee
    const loans = await Loan.find({ employeeId: employee._id });

    if (!loans || loans.length === 0) {
      return res
        .status(404)
        .json({ error: 'No loan requests found for this employee' });
    }

    // Format the response data
    const formattedLoans = loans.map((loan) => ({
      _id: loan._id,
      loanAmount: loan.loanAmount,
      monthlyInstallment: loan.monthlyInstallment,
      remainingBalance: loan.remainingBalance,
      status: loan.status,
      createdAt: loan.createdAt,
      approvedDate: loan.approvedDate || null,
    }));

    res.status(200).json(formattedLoans);
  } catch (error) {
    console.error('Error fetching loan requests for employee:', error.message);
    res.status(500).json({ error: 'Error fetching loan requests' });
  }
};
