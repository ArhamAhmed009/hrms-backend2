const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Candidate = require('../../models/Candidate');
const multer = require('multer');

// Mock the Candidate model and file upload
jest.mock('../../models/Candidate');
jest.mock('multer', () => {
    const multer = jest.fn(() => ({
      single: jest.fn(() => (req, res, next) => {
        req.file = { path: 'uploads/resumes/test-resume.pdf' };
        next();
      })
    }));
    multer.diskStorage = jest.fn(() => ({
      destination: jest.fn(),
      filename: jest.fn(),
    }));
    return multer;
  });
  
  

describe('Candidate Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('addCandidate', () => {
    it('should add a candidate with a file upload', async () => {
        const mockCandidateData = {
            candidateId: 'C123',
            name: 'John Doe',
            position: 'Software Engineer',
            experience: 5,
            skills: 'JavaScript, Node.js, React',
            education: 'Bachelor in Computer Science',
            resume: 'uploads/resumes/test-resume.pdf',
          };
          

      Candidate.mockReturnValue({
        ...mockCandidateData,
        save: jest.fn().mockResolvedValue(mockCandidateData),
      });

      const response = await request(app)
        .post('/api/candidates')
        .send(mockCandidateData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('candidateId', mockCandidateData.candidateId);
      expect(response.body).toHaveProperty('resume', mockCandidateData.resume);
    });

    it('should return 500 if there is an error adding a candidate', async () => {
      Candidate.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/candidates')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error adding candidate');
    });
  });

  describe('getAllCandidates', () => {
    it('should return all candidates', async () => {
      const mockCandidates = [
        { candidateId: 'C123', name: 'John Doe' },
        { candidateId: 'C124', name: 'Jane Smith' },
      ];

      Candidate.find.mockResolvedValue(mockCandidates);

      const response = await request(app).get('/api/candidates');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCandidates);
    });

    it('should return 500 if there is an error fetching candidates', async () => {
      Candidate.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/candidates');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error fetching candidates');
    });
  });

  describe('shortlistCandidate', () => {
    it('should update candidate to shortlisted', async () => {
      const mockCandidate = {
        candidateId: 'C123',
        isShortlisted: true,
      };

      Candidate.findOneAndUpdate.mockResolvedValue(mockCandidate);

      const response = await request(app)
        .patch('/api/candidates/C123/shortlist')
        .send({ isShortlisted: true });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isShortlisted', true);
    });

    it('should return 404 if candidate is not found', async () => {
      Candidate.findOneAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/candidates/C999/shortlist')
        .send({ isShortlisted: true });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Candidate not found');
    });

    it('should return 500 if there is an error updating shortlist status', async () => {
      Candidate.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch('/api/candidates/C123/shortlist')
        .send({ isShortlisted: true });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error updating candidate shortlist status');
    });
  });


});
