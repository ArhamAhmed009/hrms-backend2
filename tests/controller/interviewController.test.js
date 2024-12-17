const request = require('supertest');
const app = require('../../app');
const Interview = require('../../models/Interview');
const Candidate = require('../../models/Candidate');
const mongoose = require('mongoose');

jest.mock('../../models/Interview');
jest.mock('../../models/Candidate');

describe('Interview Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /api/interviews/schedule', () => {
    it('should schedule an interview for a shortlisted candidate', async () => {
      const mockCandidate = { candidateId: 'C123', isShortlisted: true, position: 'Software Engineer' };
      const mockInterview = {
        candidateId: 'C123',
        interviewId: 'I123',
        position: 'Software Engineer',
        date: '2024-11-12',
        time: '10:00',
        employerPanel: ['John Doe', 'Jane Smith'],
      };

      Candidate.findOne.mockResolvedValue(mockCandidate);
      Interview.find.mockResolvedValue([]);
      Interview.prototype.save = jest.fn().mockResolvedValue(mockInterview);

      const response = await request(app).post('/api/interviews/schedule').send({
        candidateId: 'C123',
        interviewId: 'I123',
        date: '2024-11-12',
        time: '10:00',
        employerPanel: ['John Doe', 'Jane Smith'],
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(mockInterview);
    });

    it('should return 404 if the candidate is not shortlisted', async () => {
      Candidate.findOne.mockResolvedValue(null);  // Simulate candidate not found

      const response = await request(app).post('/api/interviews/schedule').send({
        candidateId: 'C123',
        interviewId: 'I123',
        date: '2024-11-12',
        time: '10:00',
        employerPanel: ['John Doe', 'Jane Smith'],
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Shortlisted candidate not found');
    });

    it('should return 400 if an interview is scheduled within 30 minutes of an existing interview', async () => {
      const mockCandidate = { candidateId: 'C123', isShortlisted: true, position: 'Software Engineer' };
      const existingInterview = { date: '2024-11-12', time: '10:15' };

      Candidate.findOne.mockResolvedValue(mockCandidate);
      Interview.find.mockResolvedValue([existingInterview]);

      const response = await request(app).post('/api/interviews/schedule').send({
        candidateId: 'C123',
        interviewId: 'I123',
        date: '2024-11-12',
        time: '10:30',
        employerPanel: ['John Doe', 'Jane Smith'],
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'An interview is already scheduled within 30 minutes of this time.');
    });

    it('should return 500 if there is an error scheduling the interview', async () => {
      Candidate.findOne.mockRejectedValue(new Error('Database error'));  // Simulate database error

      const response = await request(app).post('/api/interviews/schedule').send({
        candidateId: 'C123',
        interviewId: 'I123',
        date: '2024-11-12',
        time: '10:00',
        employerPanel: ['John Doe', 'Jane Smith'],
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error scheduling interview');
    });
  });

  describe('GET /api/interviews', () => {
    it('should fetch all interviews', async () => {
      const mockInterviews = [
        { candidateId: 'C123', interviewId: 'I123', position: 'Software Engineer', date: '2024-11-12', time: '10:00' },
        { candidateId: 'C124', interviewId: 'I124', position: 'Product Manager', date: '2024-11-13', time: '11:00' },
      ];

      Interview.find.mockResolvedValue(mockInterviews);

      const response = await request(app).get('/api/interviews');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockInterviews);
    });

    it('should return 500 if there is an error fetching interviews', async () => {
      Interview.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/interviews');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error fetching interviews');
    });
  });
});
