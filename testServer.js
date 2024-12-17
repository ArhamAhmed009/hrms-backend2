const express = require('express');
const mongoose = require('mongoose');
const TimeSheet = require('./models/TimeSheet'); // Adjust path if needed

const app = express();
const PORT = 5001; // Use a different port for testing

mongoose.connect('mongodb+srv://arhamnaeem009:Asd12345@cluster0.xjyl7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

mongoose.set('debug', true); // Enable Mongoose debug mode

app.get('/api/timesheets/all', async (req, res) => {
  try {
    const timeSheets = await TimeSheet.find({});
    console.log("Fetched TimeSheets:", timeSheets);
    res.status(200).json(timeSheets);
  } catch (error) {
    console.error('Error fetching all timesheets:', error.message);
    res.status(500).json({ error: 'Error fetching all timesheets' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
