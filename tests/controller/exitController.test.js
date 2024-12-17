const request = require('supertest');
const app = require('../../app');
const Exit = require('../../models/Exit');
const Salary = require('../../models/Salary');
const Employee = require('../../models/Employee');
const mongoose = require('mongoose');
const pdf = require('html-pdf');

// Simplify mocks
jest.mock('fs');
jest.mock('../../models/Exit');
jest.mock('../../models/Salary');
jest.mock('../../models/Employee');
jest.mock('html-pdf');

describe('Exit Controller', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('processEmployeeExit', () => {
    it('should process an employee exit and create an exit record', async () => {
      // Mock data setup
      const mockEmployee = { _id: '123', employeeId: 'E123', name: 'John Doe' };
      const mockExit = {
        employeeId: mockEmployee._id,
        exitType: 'Resignation',
        exitDate: new Date(),
        reason: 'Personal reasons',
        resignationFile: 'uploads/resignations/test-file.pdf',
        approvalStatus: 'Pending',
      };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Exit.prototype.save = jest.fn().mockResolvedValue(mockExit);

      const response = await request(app)
        .post('/api/exits/process-exit')
        .field('employeeId', 'E123')
        .field('exitType', 'Resignation')
        .field('exitDate', '2024-11-12')
        .field('reason', 'Personal reasons')
        .attach('resignationFile', 'path_to_existing_test_file.pdf'); // Ensure this file exists for the test

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('employeeId', mockExit.employeeId);
    });

    it('should return 404 if the employee is not found', async () => {
      Employee.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/exits/process-exit')
        .send({
          employeeId: 'E123',
          exitType: 'Resignation',
          exitDate: '2024-11-12',
          reason: 'Personal reasons',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Employee not found');
    });
  });

  describe('generateExitReport', () => {
    it('should generate an exit report PDF', async () => {
      const mockExit = {
        _id: '1',
        employeeId: { name: 'John Doe', position: 'Software Engineer' },
        exitType: 'Resignation',
        exitDate: new Date(),
      };

      Exit.findById.mockResolvedValue(mockExit);
      pdf.create.mockImplementation((html, options, callback) => {
        callback(null, Buffer.from('PDF content'));
      });

      const response = await request(app).get('/api/exits/report/1');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('getAllExits', () => {
    it('should fetch all exit records', async () => {
      const mockExits = [
        { _id: '1', employeeId: 'E123', exitType: 'Resignation', exitDate: new Date() },
        { _id: '2', employeeId: 'E124', exitType: 'Retirement', exitDate: new Date() },
      ];

      Exit.find.mockResolvedValue(mockExits);

      const response = await request(app).get('/api/exits');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockExits);
    });
  });

  describe('approveExit', () => {
    it('should update the approval status of an exit', async () => {
      const mockExit = { _id: '1', approvalStatus: 'Approved' };

      Exit.findByIdAndUpdate.mockResolvedValue(mockExit);

      const response = await request(app).patch('/api/exits/1/approve').send({ approvalStatus: 'Approved' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('approvalStatus', 'Approved');
    });
  });
});
