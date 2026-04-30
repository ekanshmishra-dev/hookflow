const { Queue } = require('bullmq');
const connection = require('./connection');

// Initialize BullMQ queue for webhooks
const webhookQueue = new Queue('webhookQueue', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000 // 1s, 2s, 4s
    },
    removeOnComplete: true,
    removeOnFail: false // keep failed jobs in BullMQ to handle 'failed' event
  }
});

module.exports = webhookQueue;
