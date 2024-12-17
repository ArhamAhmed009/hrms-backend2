const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  loanAmount: { type: Number, required: true },
  approvedAmount: { type: Number, default: 0 },
  remainingBalance: { type: Number, required: true },
  monthlyInstallment: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  approvedDate: { type: Date },
  createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Loan', LoanSchema);
