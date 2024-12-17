const Leave = require('../models/Leave');
const moment = require('moment');

// Employee requests leave
exports.requestLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const leave = new Leave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await leave.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error) {
    console.error('Error requesting leave:', error.message);
    res.status(500).json({ error: 'Error requesting leave' });
  }
};

// Get leave requests for HR (Pending, Approved, or Rejected)
exports.getLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query; // Filter by status if provided
    const leaveRequests = await Leave.find(status ? { status } : {});
    
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error.message);
    res.status(500).json({ error: 'Error fetching leave requests' });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { employeeId, leaveId } = req.params; // Assume leaveId is also provided in the params
    const { status } = req.body;

    // Find and update the specific leave request by employeeId and leaveId
    const leaveRequest = await Leave.findOneAndUpdate(
      { employeeId, _id: leaveId },  // Match both employeeId and leaveId
      { status },  // Update the status field
      { new: true }  // Return the updated document
    );

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found for this employee' });
    }

    res.status(200).json({ message: 'Leave status updated successfully', leaveRequest });
  } catch (error) {
    console.error('Error updating leave status:', error.message);
    res.status(500).json({ error: 'Error updating leave status' });
  }
};

  

// Get leave status for a specific employee
exports.getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaveRequests = await Leave.find({ employeeId });

    if (!leaveRequests.length) {
      return res.status(404).json({ error: 'No leave requests found for this employee' });
    }

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error.message);
    res.status(500).json({ error: 'Error fetching employee leave requests' });
  }
};
