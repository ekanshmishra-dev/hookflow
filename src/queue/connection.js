const Redis = require('ioredis');
require('dotenv').config();

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null // BullMQ requires this to be null
};

const connection = new Redis(redisOptions);

connection.on('connect', () => {
  console.log('[Redis] Connected to server');
});

connection.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

connection.on('close', () => {
  console.warn('[Redis] Connection closed');
});

module.exports = connection;
