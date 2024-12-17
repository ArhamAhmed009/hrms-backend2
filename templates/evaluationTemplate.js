module.exports = (evaluation) => `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .criteria { font-weight: bold; }
        .footer { margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Candidate Evaluation Report</h1>
      <p><strong>Candidate ID:</strong> ${evaluation.candidateId}</p>
      <p><strong>Evaluator ID:</strong> ${evaluation.evaluatorId}</p>

      <table>
        <tr><th class="criteria">Criteria</th><th>Score</th></tr>
        <tr><td>Technical Skills</td><td>${evaluation.technicalSkills}</td></tr>
        <tr><td>Problem Solving</td><td>${evaluation.problemSolving}</td></tr>
        <tr><td>Behavioral Fit</td><td>${evaluation.behavioralFit}</td></tr>
        <tr><td>Cultural Fit</td><td>${evaluation.culturalFit}</td></tr>
        <tr><td>Communication Skills</td><td>${evaluation.communicationSkills}</td></tr>
        <tr><td>Adaptability</td><td>${evaluation.adaptability}</td></tr>
        <tr><td>Situational Judgment</td><td>${evaluation.situationalJudgment}</td></tr>
        <tr><td>Motivation & Interest</td><td>${evaluation.motivationInterest}</td></tr>
        <tr><td>Overall Impression</td><td>${evaluation.overallImpression}</td></tr>
      </table>

      <p class="footer"><strong>Comments:</strong> ${evaluation.comments}</p>
      <p class="footer"><strong>Final Decision:</strong> ${evaluation.finalDecision}</p>
    </body>
  </html>
`;
