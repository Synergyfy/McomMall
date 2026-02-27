import Redis from 'ioredis-mock';

jest.mock('ioredis', () => {
  return jest.fn(() => new Redis());
});

// If there are other modules implicitly using Redis (like BullMQ), they might need specific mocks too,
// but usually mocking ioredis covers the connection layer.
