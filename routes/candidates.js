const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');

// Route to add a new candidate
router.post('/', candidateController.addCandidate);

// Route to get all candidates
router.get('/', candidateController.getAllCandidates);

// Route to shortlist a candidate
router.put('/:id/shortlist', candidateController.shortlistCandidate);

// Route to delete a candidate
router.delete('/:id', candidateController.deleteCandidate);

module.exports = router;
