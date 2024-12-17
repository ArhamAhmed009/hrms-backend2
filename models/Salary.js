const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  baseSalary: {
    type: Number,
    required: true,
  },
  isTaxFiler: { // New field for tax filer status
    type: Boolean,
    default: false,
  },
  allowances: {
    houseRentAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    fuelAllowance: { type: Number, default: 0 },
    childrenEducationAllowance: { type: Number, default: 0 },
    utilitiesAllowance: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
  },
  deductions: {
    professionalTax: { type: Number, default: 0 },
    furtherTax: { type: Number, default: 0 },
    zakat: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 }, // Calculated based on base salary
    taxDeduction: { type: Number, default: 0 },  // Calculated based on tax filer status
    loanInstallment: { type: Number, default: 0 }, // Ensure loan installment is included

    otherDeductions: { type: Number, default: 0 },
  },
  totalSalary: {
    type: Number,
    required: true,
  },
  salaryMonth: {
    type: String,
    required: true,
  },
  salaryYear: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

  const Salary = mongoose.model('Salary', salarySchema);

  module.exports = Salary;
