const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs to check if directory exists
const Exit = require('../models/Exit');
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const pdf = require('html-pdf');
const generateExitReportHtml = require('../templates/exitReportTemplate');

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/resignations';
    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir); // specify the path where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Process Employee Exit with Resignation File
exports.processEmployeeExit = [
  upload.single('resignationFile'), // Middleware to handle file upload
  async (req, res) => {
    try {
      const { employeeId, exitType, exitDate, reason } = req.body;
      const resignationFile = req.file ? req.file.path.replace(/\\/g, "/") : null; // Normalize file path

      // Convert exitDate string to Date object
      const exitDateObj = new Date(exitDate);

      // Find the employee
      const employee = await Employee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Fetch all salary records for the employee to calculate total provident fund
      const salaries = await Salary.find({ employeeId: employee._id });
      const totalProvidentFund = salaries.reduce((total, salary) => total + (salary.baseSalary * 0.12), 0);

      // Calculate remaining salary for the exit month
      let remainingSalary = 0;
      const lastSalaryRecord = await Salary.findOne({ employeeId: employee._id }).sort({ createdAt: -1 });

      if (lastSalaryRecord) {
        const daysWorked = exitDateObj.getDate();
        const daysInMonth = new Date(exitDateObj.getFullYear(), exitDateObj.getMonth() + 1, 0).getDate();
        remainingSalary = (lastSalaryRecord.baseSalary / daysInMonth) * daysWorked;
      }

      // Create the exit record with 'Pending' approval status
      const exitRecord = new Exit({
        employeeId: employee._id,
        exitType,
        exitDate: exitDateObj,
        reason,
        resignationFile,
        approvalStatus: 'Pending',
        remainingSalary,
        providentFund: totalProvidentFund,
      });

      await exitRecord.save();
      res.status(201).json(exitRecord);
    } catch (error) {
      console.error('Error processing employee exit:', error);
      res.status(500).json({ error: `Error processing employee exit: ${error.message}` });
    }
  }
];

// Generate Exit Report
exports.generateExitReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the exit record
    const exit = await Exit.findById(id).populate('employeeId');
    if (!exit) {
      return res.status(404).json({ error: 'Exit record not found' });
    }

    // Generate HTML for exit report
    const html = generateExitReportHtml(exit);

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
        'Content-Disposition': `attachment;filename=ExitReport_${id}.pdf`,
      }).end(buffer);
    });
  } catch (error) {
    console.error('Error generating exit report:', error);
    res.status(500).json({ error: `Error generating exit report: ${error.message}` });
  }
};

// Get All Exit Records
exports.getAllExits = async (req, res) => {
  try {
    const exits = await Exit.find().populate('employeeId', 'employeeId name position');
    res.status(200).json(exits);
  } catch (error) {
    console.error('Error fetching exits:', error);
    res.status(500).json({ error: 'Error fetching exits' });
  }
};

// Approve or Reject Resignation
exports.approveExit = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    // Update the exit record with the new approval status
    const exit = await Exit.findByIdAndUpdate(
      id,
      { approvalStatus },
      { new: true }
    );

    if (!exit) {
      return res.status(404).json({ error: 'Exit record not found' });
    }

    res.status(200).json(exit);
  } catch (error) {
    console.error('Error approving exit:', error);
    res.status(500).json({ error: 'Error approving exit' });
  }
};

// Get All Exit Records
exports.getAllExits = async (req, res) => {
  try {
    const exits = await Exit.find()
      .populate('employeeId', 'employeeId name position'); // Populate specific fields

    res.status(200).json(exits);
  } catch (error) {
    console.error('Error fetching exits:', error);
    res.status(500).json({ error: 'Error fetching exits' });
  }
};
