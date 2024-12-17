const Attendance = require('../models/Attendance');
const moment = require('moment');

// Mark attendance for check-in
exports.markAttendance = async (req, res) => {
  const { employeeId } = req.body;
  const currentTime = moment();
  const officeStartTime = moment().set({ hour: 9, minute: 30 }); // 9:30 AM
  const officeEndTime = moment().set({ hour: 16, minute: 30 }); // 4:30 PM

  try {
    // Check if attendance already exists for today
    const today = moment().startOf('day');
    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    // If the employee hasn't checked in today, mark the check-in
    if (!attendance) {
      const checkInTime = currentTime.format('hh:mm A');
      const status = currentTime.isAfter(officeStartTime) ? 'Late' : 'Present';

      attendance = new Attendance({
        employeeId,
        date: currentTime.toDate(),
        checkInTime,
        status
      });

      await attendance.save();

      return res.status(200).json({
        message: 'Check-in successful',
        status,
        checkInTime
      });
    } else if (!attendance.checkOutTime) {
      return res.status(400).json({ message: 'Please check out before checking in again.' });
    }

    return res.status(400).json({ message: 'Attendance already marked for today.' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance.' });
  }
};

// Mark attendance for check-out
exports.markCheckOut = async (req, res) => {
  const { employeeId } = req.body;
  const currentTime = moment();
  const officeEndTime = moment().set({ hour: 16, minute: 30 }); // 4:30 PM

  try {
    const today = moment().startOf('day');
    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today.' });
    }

    // If already checked out, don't allow another checkout
    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out for today.' });
    }

    const checkOutTime = currentTime.format('hh:mm A');
    const isShortLeave = currentTime.isBefore(officeEndTime) ? true : false;

    attendance.checkOutTime = checkOutTime;
    attendance.isShortLeave = isShortLeave;
    await attendance.save();

    const status = isShortLeave ? 'Short Leave' : attendance.status; // Keep the initial status unless short leave

    return res.status(200).json({
      message: 'Check-out successful',
      status,
      checkOutTime
    });
  } catch (error) {
    console.error('Error marking check-out:', error);
    res.status(500).json({ message: 'Error marking check-out.' });
  }
};
