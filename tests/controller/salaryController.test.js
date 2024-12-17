const request = require('supertest');
const app = require('../../app');
const Salary = require('../../models/Salary');
const Employee = require('../../models/Employee');

jest.mock('../../models/Salary');
jest.mock('../../models/Employee');

describe('Salary Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSalary', () => {
    it('should create a new salary record for an employee', async () => {
      const mockEmployee = { _id: '123', employeeId: 'E001' };
      const mockSalary = {
        _id: '456',
        employeeId: mockEmployee._id,
        baseSalary: 5000,
        allowances: { bonus: 1000 },
        deductions: { tax: 200 },
        totalSalary: 5800,
        populate: jest.fn().mockResolvedValueOnce({
          ...mockEmployee,
          allowances: { bonus: 1000 },
          deductions: { tax: 200 },
        }),
      };

      Employee.findOne.mockResolvedValue(mockEmployee);
      Salary.prototype.save = jest.fn().mockResolvedValue(mockSalary);

      const response = await request(app)
        .post('/api/salaries')
        .send({
          employeeId: 'E001',
          baseSalary: 5000,
          allowances: { bonus: 1000 },
          deductions: { tax: 200 },
          isTaxFiler: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('totalSalary', 5800);
    });

    it('should return 404 if the employee is not found', async () => {
      Employee.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/salaries')
        .send({
          employeeId: 'E001',
          baseSalary: 5000,
          allowances: { bonus: 1000 },
          deductions: { tax: 200 },
          isTaxFiler: true,
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Employee not found');
    });
  });
});
