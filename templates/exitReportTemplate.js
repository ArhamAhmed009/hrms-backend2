  module.exports = (exit) => {
      return `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Exit Report for ${exit.employeeId.name}</h1>
          <p><strong>Employee ID:</strong> ${exit.employeeId.employeeId}</p>
          <p><strong>Exit Type:</strong> ${exit.exitType}</p>
          <p><strong>Exit Date:</strong> ${new Date(exit.exitDate).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> ${exit.reason}</p>
          
          <h2>Salary Details</h2>
          <table>
            <tr>
              <th>Remaining Salary</th>
              <td>${exit.remainingSalary.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Provident Fund</th>
              <td>${exit.providentFund.toFixed(2)}</td>
            </tr>
          </table>
        </body>
        </html>
      `;
    };
    