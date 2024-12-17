const generateSalarySlipHtml = (salary) => {
  const totalAllowances = Object.values(salary.allowances).reduce((acc, val) => acc + parseFloat(val || 0), 0) + 
                          (salary.otherAllowances ? salary.otherAllowances.reduce((acc, allowance) => acc + parseFloat(allowance.value || 0), 0) : 0);

  const totalDeductions = Object.values(salary.deductions).reduce((acc, val) => acc + parseFloat(val || 0), 0) + 
                          (salary.otherDeductions ? salary.otherDeductions.reduce((acc, deduction) => acc + parseFloat(deduction.value || 0), 0) : 0);

  const netSalary = (parseFloat(salary.baseSalary) + totalAllowances - totalDeductions).toFixed(2);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Salary Slip</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ddd; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 8px 12px; text-align: left; }
        .text-right { text-align: right; }
        .highlight { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Eclosol - Salary Slip</h1>
        <p>Month: ${salary.salaryMonth}, ${salary.salaryYear}</p>

        <h2>Employee Details</h2>
        <table>
          <tr>
            <th>Employee Name</th>
            <td>${salary.employeeId?.name || "N/A"}</td>
          </tr>
          <tr>
            <th>Employee ID</th>
            <td>${salary.employeeId?.employeeId || "N/A"}</td>
          </tr>
          <tr>
            <th>Position</th>
            <td>${salary.employeeId?.position || "N/A"}</td>
          </tr>
          <tr>
            <th>Hire Date</th>
            <td>${salary.employeeId?.hireDate ? new Date(salary.employeeId.hireDate).toLocaleDateString() : "N/A"}</td>
          </tr>
        </table>

        <h2>Earnings</h2>
        <table>
          <tr><th>Base Salary</th><td>${parseFloat(salary.baseSalary || 0).toFixed(2)}</td></tr>
          <tr><th>House Rent Allowance</th><td>${salary.allowances.houseRentAllowance || 0}</td></tr>
          <tr><th>Medical Allowance</th><td>${salary.allowances.medicalAllowance || 0}</td></tr>
          <tr><th>Fuel Allowance</th><td>${salary.allowances.fuelAllowance || 0}</td></tr>
          <tr><th>Children Education Allowance</th><td>${salary.allowances.childrenEducationAllowance || 0}</td></tr>
          <tr><th>Utilities Allowance</th><td>${salary.allowances.utilitiesAllowance || 0}</td></tr>
          ${
            salary.otherAllowances && salary.otherAllowances.length > 0
              ? salary.otherAllowances
                  .map((allowance) => `<tr><th>${allowance.name}</th><td>${parseFloat(allowance.value || 0).toFixed(2)}</td></tr>`)
                  .join("")
              : ""
          }
          <tr class="highlight"><th>Total Earnings(Without Base Salary)</th><td>${totalAllowances.toFixed(2)}</td></tr>
        </table>

        <h2>Deductions</h2>
        <table>
          <tr><th>Professional Tax</th><td>${salary.deductions.professionalTax || 0}</td></tr>
          <tr><th>Further Tax</th><td>${salary.deductions.furtherTax || 0}</td></tr>
          <tr><th>Zakat</th><td>${salary.deductions.zakat || 0}</td></tr>
          <tr><th>Tax Deduction</th><td>${salary.deductions.taxDeduction || 0}</td></tr>
          <tr><th>Provident Fund</th><td>${salary.deductions.providentFund || 0}</td></tr>
          ${
            salary.otherDeductions && salary.otherDeductions.length > 0
              ? salary.otherDeductions
                  .map((deduction) => `<tr><th>${deduction.name}</th><td>${parseFloat(deduction.value || 0).toFixed(2)}</td></tr>`)
                  .join("")
              : ""
          }
          <tr class="highlight"><th>Total Deductions</th><td>${totalDeductions.toFixed(2)}</td></tr>
        </table>

        <h2>Net Salary</h2>
        <table>
          <tr class="highlight"><th>Net Salary</th><td>${netSalary}</td></tr>
        </table>

        <p class="text-right">Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = generateSalarySlipHtml;
