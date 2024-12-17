const mongoose = require('mongoose');

// Mock mongoose connection
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    close: jest.fn().mockResolvedValue(true),
    on: jest.fn(),
    readyState: 1,
  },
  model: jest.fn().mockReturnThis(),
  Schema: jest.fn(),
  populate: jest.fn().mockReturnThis(),
}));

afterAll(async () => {
  await mongoose.connection.close();
});
