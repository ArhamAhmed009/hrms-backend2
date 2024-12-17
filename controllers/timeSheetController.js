const TimeSheet = require('../models/TimeSheet');
const moment = require('moment');

// Add new time sheet
exports.addTimeSheet = async (req, res) => {
  try {
    const { employeeId, date, checkInTime, checkOutTime } = req.body;

    const timeSheet = new TimeSheet({
      employeeId,
      date,
      checkInTime,
      checkOutTime,
    });

    await timeSheet.save();

    res.status(201).json(timeSheet);
  } catch (error) {
    console.error('Error adding time sheet:', error.message);
    res.status(500).json({ error: 'Error adding time sheet' });
  }
};

// Get time sheets by employeeId
exports.getTimeSheetsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const timeSheets = await TimeSheet.find({ employeeId });
    
    if (!timeSheets) {
      return res.status(404).json({ error: 'No time sheets found' });
    }

    res.status(200).json(timeSheets);
  } catch (error) {
    console.error('Error fetching time sheets:', error.message);
    res.status(500).json({ error: 'Error fetching time sheets' });
  }
};

// Update time sheet (for changing checkInTime, checkOutTime)
exports.updateTimeSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInTime, checkOutTime } = req.body;

    const updatedTimeSheet = await TimeSheet.findByIdAndUpdate(
      id,
      { checkInTime, checkOutTime },
      { new: true }
    );

    if (!updatedTimeSheet) {
      return res.status(404).json({ error: 'Time sheet not found' });
    }

    res.status(200).json(updatedTimeSheet);
  } catch (error) {
    console.error('Error updating time sheet:', error.message);
    res.status(500).json({ error: 'Error updating time sheet' });
  }
};

// Delete a time sheet
exports.deleteTimeSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const timeSheet = await TimeSheet.findByIdAndDelete(id);

    if (!timeSheet) {
      return res.status(404).json({ error: 'Time sheet not found' });
    }

    res.status(200).json({ message: 'Time sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting time sheet:', error.message);
    res.status(500).json({ error: 'Error deleting time sheet' });
  }
};

// Automated weekly report generation
exports.generateWeeklyReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const startDate = moment().startOf('week').toDate();  // Start of current week
    const endDate = moment().endOf('week').toDate();      // End of current week

    const timeSheets = await TimeSheet.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (timeSheets.length === 0) {
      return res.status(404).json({ error: 'No timesheets found for this week' });
    }

    const totalHours = timeSheets.reduce((acc, ts) => {
      const start = moment(ts.checkInTime);
      const end = moment(ts.checkOutTime);
      const duration = moment.duration(end.diff(start));
      return acc + duration.asHours();
    }, 0);

    res.json({ employeeId, totalHours, timeSheets });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ error: 'Error generating weekly report' });
  }
};

// Automated monthly report generation
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const startDate = moment().startOf('month').toDate();  // Start of current month
    const endDate = moment().endOf('month').toDate();      // End of current month

    const timeSheets = await TimeSheet.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (timeSheets.length === 0) {
      return res.status(404).json({ error: 'No timesheets found for this month' });
    }

    const totalHours = timeSheets.reduce((acc, ts) => {
      const start = moment(ts.checkInTime);
      const end = moment(ts.checkOutTime);
      const duration = moment.duration(end.diff(start));
      return acc + duration.asHours();
    }, 0);

    res.json({ employeeId, totalHours, timeSheets });
  } catch (error) {
    console.error('Error generating monthly report:', error.message);
    res.status(500).json({ error: 'Error generating monthly report' });
  }
};

// Get overall weekly hours (aggregated)
exports.getOverallWeeklyHours = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())); // Start of the current week

    const timesheets = await TimeSheet.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek } // Match timesheets in the current week
        }
      },
      {
        $group: {
          _id: null,
          totalHours: {
            $sum: "$totalHours" // Sum the totalHours field that has been pre-calculated
          }
        }
      }
    ]);

    const totalHours = timesheets.length > 0 ? timesheets[0].totalHours : 0;
    res.status(200).json({ totalHours });
  } catch (error) {
    console.error('Error fetching weekly hours:', error);
    res.status(500).json({ error: 'Error fetching weekly hours' });
  }
};

// Get overall monthly hours (aggregated)
exports.getOverallMonthlyHours = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const timeSheets = await TimeSheet.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: "$totalHours" }, // Sum the totalHours field
        },
      },
    ]);

    const totalHours = timeSheets.length > 0 ? timeSheets[0].totalHours : 0;
    res.status(200).json({ totalHours });
  } catch (error) {
    console.error('Error fetching monthly hours:', error.message);
    res.status(500).json({ error: 'Error fetching monthly hours' });
  }
};

// Mark attendance for check-in (start time)
exports.checkIn = async (req, res) => {
  const { employeeId } = req.body;
  const currentTime = moment();
  const officeStartTime = moment().set({ hour: 9, minute: 30 });

  try {
    // Check if a timesheet already exists for today
    const today = moment().startOf('day');
    let timeSheet = await TimeSheet.findOne({
      employeeId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    if (!timeSheet) {
      // New time sheet entry for today
      const checkInTime = currentTime.toDate();
      const status = currentTime.isAfter(officeStartTime) ? 'Late' : 'Present';

      timeSheet = new TimeSheet({
        employeeId,
        date: today.toDate(),
        checkInTime,
        status
      });

      await timeSheet.save();
      return res.status(200).json({
        message: 'Check-in successful',
        status,
        checkInTime: currentTime.format('hh:mm A')
      });
    } else if (!timeSheet.checkOutTime) {
      return res.status(400).json({ message: 'Already checked in. Please check out before checking in again.' });
    }

    return res.status(400).json({ message: 'Attendance already marked for today.' });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ message: 'Error during check-in.' });
  }
};

// Mark attendance for check-out (end time)
exports.checkOut = async (req, res) => {
  const { employeeId } = req.body;
  const currentTime = moment();
  const officeEndTime = moment().set({ hour: 16, minute: 30 });

  try {
    const today = moment().startOf('day');
    let timeSheet = await TimeSheet.findOne({
      employeeId,
      date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
    });

    if (!timeSheet) {
      return res.status(400).json({ message: 'No check-in record found for today.' });
    }

    if (timeSheet.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out for today.' });
    }

    const checkOutTime = currentTime.toDate();
    const isShortLeave = currentTime.isBefore(officeEndTime);

    timeSheet.checkOutTime = checkOutTime;
    timeSheet.isShortLeave = isShortLeave;
    timeSheet.status = isShortLeave ? 'Short Leave' : timeSheet.status;
    await timeSheet.save();

    return res.status(200).json({
      message: 'Check-out successful',
      status: timeSheet.status,
      checkOutTime: currentTime.format('hh:mm A'),
      totalHours: timeSheet.formattedTotalHours
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({ message: 'Error during check-out.' });
  }
};

// Get all timesheets sorted by date in descending order
exports.getAllTimeSheetsSorted = async (req, res) => {
  try {
    const timeSheets = await TimeSheet.find({}).sort({ date: -1 });
    console.log("Fetched timeSheets:", timeSheets); // Add this to verify
    if (!timeSheets.length) {
      return res.status(404).json({ message: "No time sheets found." });
    }
    res.status(200).json(timeSheets);
  } catch (error) {
    console.error('Error fetching all timesheets:', error.message);
    res.status(500).json({ error: 'Error fetching all timesheets' });
  }
};







  

