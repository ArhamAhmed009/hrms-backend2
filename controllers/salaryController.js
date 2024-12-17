const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const PDFDocument = require('pdfkit');
const path = require('path');
const generateSalarySlipHtml = require('../templates/salarySlipTemplate');
const pdf = require('html-pdf');
const Loan = require('../models/Loan'); // Import Loan model


exports.createSalary = async (req, res) => {
  try {
    const {
      employeeId,
      baseSalary,
      allowances = {},
      deductions = {},
      isTaxFiler,
    } = req.body;

    // Find the employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Default Allowances
    const defaultAllowances = {
      houseRentAllowance: 0,
      medicalAllowance: 0,
      fuelAllowance: 0,
      childrenEducationAllowance: 0,
      utilitiesAllowance: 0,
      otherAllowance: 0,
    };

    // Default Deductions
    const defaultDeductions = {
      providentFund: baseSalary * 0.05,
      taxDeduction: isTaxFiler ? baseSalary * 0.12 : baseSalary * 0.06,
      professionalTax: 0,
      furtherTax: 0,
      zakat: 0,
      otherDeductions: 0,
    };

    // Merge allowances and deductions with defaults
    const finalAllowances = { ...defaultAllowances, ...allowances };
    let finalDeductions = { ...defaultDeductions, ...deductions };

    // Fetch active loan installment
    const loan = await Loan.findOne({ employeeId: employee._id, status: 'Approved' });
    const loanInstallment = loan ? loan.monthlyInstallment : 0;

    // Add loan installment to deductions
    finalDeductions.loanInstallment = loanInstallment;

    // Calculate total salary
    const totalAllowances = Object.values(finalAllowances).reduce((acc, val) => acc + val, 0);
    const totalDeductions = Object.values(finalDeductions).reduce((acc, val) => acc + val, 0);
    const totalSalary = baseSalary + totalAllowances - totalDeductions;

    // Get current month and year
    const currentDate = new Date();
    const salaryMonth = currentDate.toLocaleString('default', { month: 'long' });
    const salaryYear = currentDate.getFullYear();

    // Save salary
    const salary = new Salary({
      employeeId: employee._id,
      baseSalary,
      allowances: finalAllowances,
      deductions: finalDeductions,
      totalSalary,
      salaryMonth,
      salaryYear,
    });

    await salary.save();

    // Deduct loan balance
    if (loan) {
      loan.remainingBalance -= loanInstallment;
      if (loan.remainingBalance <= 0) {
        loan.remainingBalance = 0;
        loan.status = 'Paid';
      }
      await loan.save();
    }

    // Populate salary with employee details
    const savedSalary = await Salary.findById(salary._id).populate({
      path: 'employeeId',
      select: 'employeeId name position',
    });

    res.status(201).json(savedSalary);
  } catch (error) {
    console.error('Error creating salary:', error);
    res.status(500).json({ error: `Error creating salary: ${error.message}` });
  }
};

// Update Salary
exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { baseSalary, allowances, deductions } = req.body;

    const totalAllowances = Object.values(allowances).reduce((acc, val) => acc + val, 0);
    const totalDeductions = Object.values(deductions).reduce((acc, val) => acc + val, 0);
    const totalSalary = baseSalary + totalAllowances - totalDeductions;

    // Get current month and year
    const currentDate = new Date();
    const salaryMonth = currentDate.toLocaleString('default', { month: 'long' });
    const salaryYear = currentDate.getFullYear();

    const salary = await Salary.findByIdAndUpdate(
      id,
      { baseSalary, allowances, deductions, totalSalary, salaryMonth, salaryYear },
      { new: true }
    ).populate({
      path: 'employeeId',
      select: 'employeeId name position',
    });

    if (!salary) {
      return res.status(404).json({ error: 'Salary not found' });
    }

    res.status(200).json(salary);
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ error: 'Error updating salary' });
  }
};

// Get All Salaries
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate({
      path: 'employeeId',
      select: 'employeeId name position',
    });
    res.status(200).json(salaries);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ error: 'Error fetching salaries' });
  }
};

// Get Salary By Employee ID
exports.getSalaryByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params; // Use employeeId here
    console.log('Employee ID from request params:', employeeId);

    const employee = await Employee.findOne({ employeeId: employeeId });
    console.log('Employee found:', employee);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const salary = await Salary.findOne({ employeeId: employee._id }).populate('employeeId');
    if (!salary) {
      return res.status(404).json({ error: 'Salary not found for this employee' });
    }

    res.status(200).json(salary);
  } catch (error) {
    console.error('Error fetching salary:', error);
    res.status(500).json({ error: 'Error fetching salary' });
  }
};


// Fetch Allowances by Employee ID
exports.getAllowancesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find the employee by employeeId string (e.g., "E059")
    const employee = await Employee.findOne({ employeeId: employeeId });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Use the _id of the employee to find the salary record
    const salary = await Salary.findOne({ employeeId: employee._id }).populate('employeeId');

    if (!salary) {
      return res.status(404).json({ error: 'Allowances not found for this employee' });
    }

    res.status(200).json(salary.allowances);
  } catch (error) {
    console.error('Error fetching allowances:', error);
    res.status(500).json({ error: 'Error fetching allowances' });
  }
};


// Updated Backend Method
exports.getDeductionsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find the employee by employeeId string (e.g., "E059")
    const employee = await Employee.findOne({ employeeId: employeeId });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find the salary record
    const salary = await Salary.findOne({ employeeId: employee._id }).populate('employeeId');

    if (!salary) {
      return res.status(404).json({ error: 'Deductions not found for this employee' });
    }

    // Calculate tax based on the tax status and base salary
    const taxRate = salary.isTaxFiler ? 0.12 : 0.06; // 12% for filers, 6% for non-filers
    const taxDeduction = salary.baseSalary * taxRate;

    // Calculate provident fund based on base salary (e.g., 5% of base salary)
    const providentFundDeduction = salary.baseSalary * 0.05;
    const loan = await Loan.findOne({ employeeId: employee._id, status: 'Approved' });
    const loanInstallment = loan ? loan.monthlyInstallment : 0;
    // Include calculated tax and provident fund in the deductions
    res.status(200).json({
      ...salary.deductions,
      taxDeduction: taxDeduction.toFixed(2),
      providentFund: providentFundDeduction.toFixed(2),
      loanInstallment: loanInstallment.toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching deductions:', error);
    res.status(500).json({ error: 'Error fetching deductions' });
  }
};





// Generate detailed salary slip
exports.generateSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findById(id).populate('employeeId');
    if (!salary) {
      return res.status(404).json({ error: 'Salary record not found' });
    }

    const html = generateSalarySlipHtml(salary); // Generate the HTML for the PDF

    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
    };

    // Create PDF from HTML
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        return res.status(500).json({ error: `Error generating PDF: ${err.message}` });
      }

      // Send the PDF back as a response
      res.writeHead(200, {
        'Content-Length': buffer.length,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=SalarySlip_${id}.pdf`,
      }).end(buffer);
    });
  } catch (error) {
    console.error('Error generating salary slip:', error);
    res.status(500).json({ error: `Error generating salary slip: ${error.message}` });
  }
};

exports.getAllSalariesByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`Fetching salaries for employeeId: ${employeeId}`);

    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      console.log('Employee not found');
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('Employee found:', employee);

    const salaries = await Salary.find({ employeeId: employee._id }).populate('employeeId', 'employeeId name position');
    if (!salaries || salaries.length === 0) {
      console.log('No salary records found');
      return res.status(404).json({ error: 'No salary records found for this employee' });
    }

    console.log('Salaries found:', salaries);
    res.status(200).json(salaries);
  } catch (error) {
    console.error('Error fetching all salaries for employee:', error);
    res.status(500).json({ error: 'Error fetching salaries' });
  }
};
