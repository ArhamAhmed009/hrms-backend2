const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

// Define routes with proper callback functions
router.post('/', evaluationController.createEvaluation);
router.get('/candidate/:candidateId', evaluationController.getEvaluationsByCandidateId);
router.get('/download/:id', evaluationController.generateEvaluationReport); // PDF generation route
router.put('/:id/final-decision', evaluationController.updateFinalDecision);

module.exports = router;
