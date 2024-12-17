const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = require('../../app');
const Employee = require('../../models/Employee');

jest.mock('../../models/Employee');

describe('Auth Controller - loginEmployee', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should log in successfully with correct email and password', async () => {
    const mockEmployee = {
      _id: 'mockId',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      toObject: jest.fn().mockReturnValue({ email: 'test@example.com', role: 'employee' }),
      role: 'employee'
    };

    Employee.findOne.mockResolvedValue(mockEmployee);
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login') // Adjusted route to match app.js
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.employee.email).toBe('test@example.com');
  });

});
