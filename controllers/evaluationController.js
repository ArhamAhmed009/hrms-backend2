const Evaluation = require('../models/Evaluation');
const htmlPdf = require('html-pdf-node');
const generateEvaluationReportHtml = require('../templates/evaluationTemplate');
// Create a new evaluation
exports.createEvaluation = async (req, res) => {
  const {
    candidateId,
    evaluatorId,
    technicalSkills,
    problemSolving,
    behavioralFit,
    culturalFit,
    communicationSkills,
    adaptability,
    situationalJudgment,
    motivationInterest,
    overallImpression,
    comments,
    finalDecision,
  } = req.body;

  try {
    const evaluation = new Evaluation({
      candidateId,
      evaluatorId,
      technicalSkills,
      problemSolving,
      behavioralFit,
      culturalFit,
      communicationSkills,
      adaptability,
      situationalJudgment,
      motivationInterest,
      overallImpression,
      comments,
      finalDecision,
    });

    await evaluation.save();
    res.status(201).json({ message: 'Evaluation submitted successfully', evaluation });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    res.status(500).json({ error: 'Failed to submit evaluation' });
  }
};

// Get evaluations by candidateId
exports.getEvaluationsByCandidateId = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ candidateId: req.params.candidateId });
    if (evaluations.length === 0) return res.status(404).json({ error: 'No evaluations found for this candidate' });
    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ error: 'Failed to fetch evaluations' });
  }
};



// Generate Evaluation Report as PDF
exports.generateEvaluationReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the evaluation record
    const evaluation = await Evaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    // Generate HTML for evaluation report
    const html = generateEvaluationReportHtml(evaluation);

    const options = { format: 'A4' };
    const file = { content: html };

    // Generate PDF from HTML
    htmlPdf.generatePdf(file, options).then((pdfBuffer) => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment;filename=EvaluationReport_${id}.pdf`);
      res.send(pdfBuffer);
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    });
  } catch (error) {
    console.error('Error generating evaluation report:', error);
    res.status(500).json({ error: 'Failed to generate evaluation report' });
  }
};

// Update final decision of an evaluation
exports.updateFinalDecision = async (req, res) => {
    const { id } = req.params;
    const { finalDecision } = req.body;
  
    if (!['Selected', 'Rejected', 'On Hold'].includes(finalDecision)) {
      return res.status(400).json({ error: 'Invalid final decision value' });
    }
  
    try {
      const evaluation = await Evaluation.findByIdAndUpdate(
        id,
        { finalDecision },
        { new: true } // Return the updated document
      );
  
      if (!evaluation) {
        return res.status(404).json({ error: 'Evaluation not found' });
      }
  
      res.status(200).json({ message: 'Final decision updated successfully', evaluation });
    } catch (error) {
      console.error('Error updating final decision:', error);
      res.status(500).json({ error: 'Failed to update final decision' });
    }
  };