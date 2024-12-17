// controllers/candidateController.js
const Candidate = require('../models/Candidate');

const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes'); // Save uploaded files to 'uploads/resumes' directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`); // Give the file a unique name
  },
});

const upload = multer({ storage });

// Add a candidate with file upload
exports.addCandidate = [
  upload.single('resume'),
  async (req, res) => {
    try {
      const { candidateId, name, position, experience, skills, education } = req.body;
      const resume = req.file ? req.file.path.replace(/\\/g, "/") : null;

      // Ensure skills is a string before splitting
      const parsedSkills = skills ? skills.split(',') : [];

      const candidate = new Candidate({
        candidateId,
        name,
        position,
        experience,
        skills: parsedSkills,
        education,
        resume,
      });

      await candidate.save();
      res.status(201).json(candidate);
    } catch (error) {
      console.error('Error adding candidate:', error.message);
      res.status(500).json({ error: 'Error adding candidate' });
    }
  }
];


  

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching candidates' });
  }
};


// Update candidate to shortlisted/unshortlisted
exports.shortlistCandidate = async (req, res) => {
    try {
      const { id } = req.params; // This is the candidateId
      const { isShortlisted } = req.body;
  
      // Find candidate by candidateId and update the isShortlisted status
      const candidate = await Candidate.findOneAndUpdate(
        { candidateId: id }, // Match by candidateId instead of _id
        { isShortlisted: isShortlisted },
        { new: true }
      );
  
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
  
      res.status(200).json(candidate);
    } catch (error) {
      console.error('Error updating candidate shortlist status:', error.message);
      res.status(500).json({ error: 'Error updating candidate shortlist status' });
    }
  };
  
  
  
// Delete a candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting candidate' });
  }
};
