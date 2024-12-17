const request = require('supertest');
const app = require('../../app');
const TimeSheet = require('../../models/TimeSheet');
const mongoose = require('mongoose');

// Mock the TimeSheet model
jest.mock('../../models/TimeSheet');

describe('TimeSheet Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Mock mongoose connection close for afterAll teardown
    await mongoose.connection.close();
  });

  describe('POST /api/timesheets', () => {
    it('should add a new timesheet', async () => {
      const mockTimeSheet = {
        employeeId: '12345',
        date: new Date().toISOString(),
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
      };

      TimeSheet.prototype.save = jest.fn().mockResolvedValue(mockTimeSheet);

      const response = await request(app).post('/api/timesheets').send(mockTimeSheet);

      expect(response.status).toBe(201);
      expect(response.body).toStrictEqual(mockTimeSheet);
    });

    it('should return 500 if there is an error while adding timesheet', async () => {
      TimeSheet.prototype.save = jest.fn().mockRejectedValue(new Error('Error adding timesheet'));

      const response = await request(app).post('/api/timesheets').send({
        employeeId: '12345',
        date: new Date().toISOString(),
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error adding time sheet');
    });
  });

  describe('GET /api/timesheets/:employeeId', () => {
    it('should get timesheets by employee ID', async () => {
      const mockTimeSheets = [
        {
          employeeId: '12345',
          date: new Date().toISOString(),
          checkInTime: new Date().toISOString(),
          checkOutTime: new Date().toISOString(),
        },
      ];

      TimeSheet.find = jest.fn().mockResolvedValue(mockTimeSheets);

      const response = await request(app).get('/api/timesheets/12345');

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(mockTimeSheets);
    });

    it('should return 404 if no timesheets are found', async () => {
      TimeSheet.find = jest.fn().mockResolvedValue([]);

      const response = await request(app).get('/api/timesheets/12345');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'No time sheets found');
    });
  });

  describe('PUT /api/timesheets/:id', () => {
    it('should update an existing timesheet', async () => {
      const updatedTimeSheet = {
        _id: '1',
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
      };

      TimeSheet.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedTimeSheet);

      const response = await request(app).put('/api/timesheets/1').send({
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
      });

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(updatedTimeSheet);
    });

    it('should return 404 if the timesheet is not found', async () => {
      TimeSheet.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const response = await request(app).put('/api/timesheets/1').send({
        checkInTime: new Date().toISOString(),
        checkOutTime: new Date().toISOString(),
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Time sheet not found');
    });
  });
});
