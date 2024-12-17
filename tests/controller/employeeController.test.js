const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Employee = require('../../models/Employee');

jest.mock('../../models/Employee');

describe('Employee Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('getAllEmployees', () => {
    it('should return all employees', async () => {
      const mockEmployees = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Doe', email: 'jane@example.com' }
      ];

      Employee.find.mockResolvedValue(mockEmployees);

      const response = await request(app).get('/api/employees'); // Adjusted route to match app.js

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEmployees);
    });

    it('should return 500 if an error occurs', async () => {
      Employee.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/employees');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Error fetching employees');
    });
  });

});
