const mongoose = require('mongoose');

const timeSheetSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  checkInTime: { 
    type: Date, // Track check-in time (start)
  },
  checkOutTime: { 
    type: Date, // Track check-out time (end)
  },
  status: {
    type: String, // Possible values: Present, Late, Short Leave, etc.
    enum: ['Present', 'Late', 'Short Leave'],
  },
  totalHours: { 
    type: Number, // Automatically calculated in decimal hours
  },
  isShortLeave: { 
    type: Boolean, 
    default: false 
  },
});

// Pre-save hook to calculate total hours when check-out time is set
timeSheetSchema.pre('save', function (next) {
  if (this.checkInTime && this.checkOutTime) {
    const checkIn = new Date(this.checkInTime); 
    const checkOut = new Date(this.checkOutTime); 
    this.totalHours = (checkOut - checkIn) / (1000 * 60 * 60); // calculate total hours in decimal
  }
  next();
});

// Optional: Virtual method to get formatted total hours
timeSheetSchema.virtual('formattedTotalHours').get(function () {
  return this.totalHours ? this.totalHours.toFixed(2) : 'N/A';
});

module.exports = mongoose.model('TimeSheet', timeSheetSchema);
