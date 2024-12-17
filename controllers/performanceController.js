const Performance = require('../models/Performance');

// Add a new performance goal for an employee
// Correct date storage with proper formatting
exports.addPerformance = async (req, res) => {
    try {
      const { employeeId, goal, startDate, endDate } = req.body;
      const formattedStartDate = new Date(startDate);
      const formattedEndDate = new Date(endDate);
      const performance = new Performance({
        employeeId,
        goal,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      await performance.save();
      res.status(201).json(performance);
    } catch (error) {
      console.error('Error adding performance:', error.message);
      res.status(500).json({ error: 'Error adding performance' });
    }
  };
  

// Get all performance goals for an employee
exports.getPerformanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const performanceRecords = await Performance.find({ employeeId });
    if (!performanceRecords.length) {
      return res.status(404).json({ error: 'No performance records found' });
    }
    res.status(200).json(performanceRecords);
  } catch (error) {
    console.error('Error fetching performance records:', error.message);
    res.status(500).json({ error: 'Error fetching performance records' });
  }
};

exports.updatePerformanceProgress = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { progress, goal } = req.body;

    console.log(`Updating progress for employeeId: ${employeeId}, goal: ${goal}, progress: ${progress}`);

    // Search for the performance record by employeeId and goal
    const performance = await Performance.findOne({ employeeId, goal });

    if (!performance) {
      console.log(`Performance record not found for employeeId: ${employeeId} and goal: ${goal}`);
      return res.status(404).json({ error: 'Performance record not found for the employee and goal.' });
    }

    performance.progress = progress;  // Update the progress
    await performance.save();

    res.status(200).json({ message: 'Progress updated successfully', performance });
  } catch (error) {
    console.error('Error updating performance progress:', error.message);
    res.status(500).json({ error: 'Error updating performance progress' });
  }
};

  
  
  
  

// Submit review based on employeeId
exports.reviewPerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { review, reviewer } = req.body;

    const performance = await Performance.findOne({ employeeId }).sort({ startDate: -1 });

    if (!performance) {
      return res.status(404).json({ error: 'Performance record not found for the employee.' });
    }

    performance.review = review;
    performance.reviewer = reviewer;
    await performance.save();

    res.status(200).json({ message: 'Review submitted successfully', performance });
  } catch (error) {
    console.error('Error submitting performance review:', error.message);
    res.status(500).json({ error: 'Error submitting performance review' });
  }
};


exports.getPerformanceHistory = async (req, res) =>   {
    try {
      const { employeeId } = req.params;
      const performanceRecords = await Performance.find({ employeeId });
  
      if (!performanceRecords || !performanceRecords.length) {
        return res.status(404).json({ error: 'No performance history found' });
      }
  
      // Aggregate all history entries from all performance records
      const fullHistory = performanceRecords.map((record) => ({
        goal: record.goal,
        startDate: record.startDate,
        endDate: record.endDate,
        progress: record.progress,
        overallScore: record.overallScore,
        history: record.history,  // Include all history for each performance record
        date: record.createdAt // Assuming the record's createdAt date should be used for the history
      }));
  
      res.status(200).json(fullHistory);
    } catch (error) {
      console.error('Error fetching performance history:', error.message);
      res.status(500).json({ error: 'Error fetching performance history' });
    }
  };
  
  
  
  exports.calculateOverallScore = async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { performanceId, attendanceScore, qualityScore, collaborationScore } = req.body;
  
      const performance = await Performance.findById(performanceId);
      if (!performance) {
        return res.status(404).json({ error: 'Performance record not found' });
      }
  
      const overallScore = (attendanceScore + qualityScore + collaborationScore) / 3;
      const feedback = getFeedback(overallScore);
  
      performance.overallScore = overallScore;
      performance.feedback = feedback;
  
      // Push the history
      performance.history.push({ date: new Date(), overallScore });
  
      await performance.save();
  
      res.status(200).json({ message: 'Overall score calculated successfully', performance });
    } catch (error) {
      console.error('Error calculating overall score:', error.message);
      res.status(500).json({ error: 'Error calculating overall score' });
    }
  };
  
  

function getFeedback(overallScore) {
  if (overallScore >= 90) {
    return 'Excellent performance! Keep up the great work!';
  } else if (overallScore >= 70) {
    return 'Good performance, but there is room for improvement in collaboration or quality.';
  } else if (overallScore >= 50) {
    return 'Needs improvement in certain areas. Focus on improving quality and collaboration.';
  } else {
    return 'Performance below expectations. Requires immediate attention.';
  }
}


// Add performance history entry for an employee
exports.addPerformanceHistory = async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { date, overallScore } = req.body;
  
      const performance = await Performance.findOne({ employeeId });
      if (!performance) {
        return res.status(404).json({ error: 'Performance record not found for the employee.' });
      }
  
      performance.history.push({ date, overallScore });
      await performance.save();
  
      res.status(201).json({ message: 'Performance history added successfully', history: performance.history });
    } catch (error) {
      console.error('Error adding performance history:', error.message);
      res.status(500).json({ error: 'Error adding performance history' });
    }
  };
  