const Leave = require('../models/Leave');
const moment = require('moment');
const Employee = require('../models/Employee'); // Adjust the path as needed


// Employee requests leave
// Employee requests leave
exports.requestLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const leaveDays = moment(endDate).diff(moment(startDate), 'days') + 1;

    // Find the employee using employeeId string
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Use employee._id as the ObjectId reference
    const leave = new Leave({
      employeeId: employee._id, // Use MongoDB ObjectId
      leaveType,
      startDate,
      endDate,
      reason,
      leaveDays,
    });

    await leave.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error) {
    console.error('Error requesting leave:', error.message);
    res.status(500).json({ error: 'Error requesting leave' });
  }
};


// Project Manager updates leave status
exports.projectManagerApproval = async (req, res) => {
  try {
    const { leaveId } = req.params;
    let { status } = req.body;

    // Normalize status input to "Approved" or "Rejected"
    status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { projectManagerApproval: status },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Project Manager status updated', leave });
  } catch (error) {
    console.error('Error updating PM leave status:', error.message);
    res.status(500).json({ error: 'Error updating PM leave status' });
  }
};


// HR updates leave status (only after PM approval)
exports.hrApproval = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body; // status: 'Approved' or 'Rejected'

    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.projectManagerApproval !== 'Approved') {
      return res.status(400).json({ error: 'Leave not approved by Project Manager' });
    }

    leave.hrApproval = status;

    if (status === 'Approved') {
      leave.status = 'Approved';

      // Deduct leave days from employee's leave balance
      const employee = await Employee.findById(leave.employeeId);
      if (employee.leaveBalance < leave.leaveDays) {
        return res.status(400).json({ error: 'Insufficient leave balance' });
      }
      employee.leaveBalance -= leave.leaveDays;
      await employee.save();
    } else {
      leave.status = 'Rejected';
    }

    await leave.save();
    res.status(200).json({ message: 'HR status updated successfully', leave });
  } catch (error) {
    console.error('Error updating HR leave status:', error.message);
    res.status(500).json({ error: 'Error updating HR leave status' });
  }
};

// Get leave requests for HR/PM
exports.getLeaveRequests = async (req, res) => {
  try {
    const { status, approvalRole } = req.query; // Optional filters like status='Pending'

    let filter = {};
    if (status) filter.status = status;
    if (approvalRole === 'projectManager') {
      filter.projectManagerApproval = 'Pending';
    } else if (approvalRole === 'hr') {
      filter.projectManagerApproval = 'Approved';
      filter.hrApproval = 'Pending';
    }

    // Populate employeeId with fields 'employeeId' and 'name'
    const leaveRequests = await Leave.find(filter).populate('employeeId', 'employeeId name');

    // Map to clean up response (optional)
    const cleanLeaves = leaveRequests.map((leave) => ({
      _id: leave._id,
      employeeId: leave.employeeId?.employeeId || 'N/A', // Employee ID as string
      employeeName: leave.employeeId?.name || 'Unknown Employee', // Employee Name
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      leaveDays: leave.leaveDays,
      projectManagerApproval: leave.projectManagerApproval,
      hrApproval: leave.hrApproval,
      status: leave.status,
    }));

    res.status(200).json(cleanLeaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error.message);
    res.status(500).json({ error: 'Error fetching leave requests' });
  }
};

// Get leave balance for an employee
exports.getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params; // This is 'E092'

    // Find the employee's ObjectId using the employeeId string
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Use the resolved ObjectId to fetch leave balance
    res.status(200).json({ leaveBalance: employee.leaveBalance });
  } catch (error) {
    console.error('Error fetching leave balance:', error.message);
    res.status(500).json({ error: 'Error fetching leave balance' });
  }
};


exports.getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find the employee ObjectId
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch leave requests and populate employeeId details
    const leaveRequests = await Leave.find({ employeeId: employee._id }).populate(
      'employeeId',
      'employeeId name'
    );

    if (!leaveRequests.length) {
      return res.status(404).json({ error: 'No leave requests found for this employee' });
    }

    // Clean up the response
    const cleanLeaves = leaveRequests.map((leave) => ({
      _id: leave._id,
      employeeId: leave.employeeId?.employeeId || 'N/A',
      employeeName: leave.employeeId?.name || 'Unknown Employee',
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      leaveDays: leave.leaveDays,
      projectManagerApproval: leave.projectManagerApproval,
      hrApproval: leave.hrApproval,
      status: leave.status,
    }));

    res.status(200).json(cleanLeaves);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error.message);
    res.status(500).json({ error: 'Error fetching employee leave requests' });
  }
};


  

// Get leave status for a specific employee
exports.getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find the employee's ObjectId using the employeeId string
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch leave requests using the employee's ObjectId
    const leaveRequests = await Leave.find({ employeeId: employee._id });

    if (!leaveRequests.length) {
      return res.status(404).json({ error: 'No leave requests found for this employee' });
    }

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error.message);
    res.status(500).json({ error: 'Error fetching employee leave requests' });
  }
};


