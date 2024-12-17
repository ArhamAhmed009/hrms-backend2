const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate'); // Import the Candidate model

exports.scheduleInterview = async (req, res) => {
  try {
    const { candidateId, date, time } = req.body;

    // Check if the candidate exists and is shortlisted
    const candidate = await Candidate.findOne({ candidateId, isShortlisted: true });
    if (!candidate) {
      return res.status(404).json({ error: 'Shortlisted candidate not found' });
    }

    // Convert the date and time into a single Date object for the new interview
    const newInterviewDateTime = new Date(`${date}T${time}:00.000Z`);
    console.log("New Interview DateTime:", newInterviewDateTime);

    // Fetch all interviews on the same date
    const interviewsOnSameDate = await Interview.find({ date });
    console.log("Interviews on the same date:", interviewsOnSameDate.length);

    // Check if any interview is within the 30-minute window
    for (let interview of interviewsOnSameDate) {
      // Log the raw date and time values for debugging
      console.log("Raw interview.date:", interview.date);
      console.log("Raw interview.time:", interview.time);

      // Extract date component and manually create a valid date-time string
      const datePart = interview.date.toISOString().split("T")[0]; // Get date in YYYY-MM-DD format
      const existingInterviewDateTime = new Date(`${datePart}T${interview.time}:00.000Z`);
      
      if (isNaN(existingInterviewDateTime.getTime())) {
        console.log("Invalid Date object created from interview.date and interview.time");
        continue;
      }

      const timeDifference = Math.abs((newInterviewDateTime - existingInterviewDateTime) / (1000 * 60)); // difference in minutes
      console.log("Existing Interview DateTime:", existingInterviewDateTime);
      console.log("Time Difference (minutes):", timeDifference);

      if (timeDifference < 30) {
        console.log("Conflict Detected");
        return res.status(400).json({ error: 'An interview is already scheduled within 30 minutes of this time.' });
      }
    }

    // If no conflict, schedule the interview
    const interview = new Interview({
      candidateId,
      interviewId: req.body.interviewId,
      position: candidate.position, // Use position from candidate data
      date,
      time,
      employerPanel: req.body.employerPanel,
    });

    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ error: 'Error scheduling interview' });
  }
};




// Controller to get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching interviews' });
  }
};
