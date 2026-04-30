const Redis = require('ioredis');
require('dotenv').config();

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null // BullMQ requires this to be null
};

const connection = new Redis(redisOptions);

module.exports = connection;
