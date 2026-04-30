const { Worker } = require('bullmq');
const axios = require('axios');
const crypto = require('crypto');
const connection = require('../queue/connection');
const EventLog = require('../models/EventLog');
const Event = require('../models/Event');
const Subscriber = require('../models/Subscriber');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'super_secret_key';

const processWebhook = async (job) => {
  const { eventId, eventType, payload, subscriberUrl } = job.data;
  const attemptCount = job.attemptsMade + 1;
  console.log(`[Worker] Starting processing for event: ${eventId} (Attempt ${attemptCount}) to ${subscriberUrl}`);

  // 1. IDEMPOTENCY CHECK
  const processedKey = `processed:${eventId}`;
  const alreadyProcessed = await connection.get(processedKey);
  if (alreadyProcessed === 'success') {
    console.log(`[Worker] Event ${eventId} already successfully delivered. Skipping.`);
    return;
  }
  
  // Set a temporary lock to prevent concurrent processing of the same event
  await connection.set(processedKey, 'pending', 'EX', 60);

  // 2. RATE LIMITING PER SUBSCRIBER
  const rateKey = `rate:${subscriberUrl}:${new Date().getMinutes()}`;
  const currentRate = await connection.incr(rateKey);
  if (currentRate === 1) await connection.expire(rateKey, 60);
  
  if (currentRate > 10) {
    console.log(`[Worker] Rate limit exceeded for ${subscriberUrl}. Skipping.`);
    
    // Log the rate limited event
    await EventLog.create({
      eventId,
      url: subscriberUrl,
      status: 'failed',
      attempts: attemptCount,
      error: 'rate_limited',
      deliveredAt: new Date()
    });

    // Mark event as failed in main record
    await Event.findOneAndUpdate({ eventId }, { status: 'failed', retries: attemptCount });
    
    // Remove the temporary idempotency lock
    await connection.del(processedKey);
    return;
  }

  // 3. GENERATE SIGNATURE
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    // 4. SEND WEBHOOK
    const response = await axios.post(subscriberUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
        'x-event-id': eventId
      },
      timeout: 5000
    });

    // 5. SUCCESS LOGGING & IDEMPOTENCY UPDATE
    await EventLog.create({
      eventId,
      url: subscriberUrl,
      status: 'success',
      attempts: attemptCount,
      responseCode: response.status,
      deliveredAt: new Date()
    });

    await Event.findOneAndUpdate({ eventId }, { status: 'success', retries: attemptCount });
    
    // Mark as successfully processed in Redis
    await connection.set(processedKey, 'success', 'EX', 86400); 

    console.log(`[Worker] Successfully delivered ${eventId} to ${subscriberUrl}`);

  } catch (error) {
    const responseCode = error.response ? error.response.status : null;
    const errorMessage = error.message;

    // 6. FAILURE LOGGING
    await EventLog.create({
      eventId,
      url: subscriberUrl,
      status: 'failed',
      attempts: attemptCount,
      responseCode,
      error: errorMessage,
      deliveredAt: new Date()
    });

    // Remove the temporary lock to allow BullMQ retries
    await connection.del(processedKey);

    // Re-throw to trigger BullMQ retry logic
    console.error(`[Worker] Delivery failed for event: ${eventId} - Error: ${errorMessage}`);
    throw error;
  }
};

const webhookWorker = new Worker('webhookQueue', processWebhook, { connection });

webhookWorker.on('failed', async (job, err) => {
  const attemptCount = job.attemptsMade;
  const maxAttempts = job.opts.attempts;

  console.log(`[Worker] Job ${job.id} attempt ${attemptCount} failed: ${err.message}`);

  if (attemptCount >= maxAttempts) {
    console.log(`[Worker] Job ${job.id} failed after ${maxAttempts} attempts. Moving to deadLetterQueue.`);
    
    const dlqData = {
      eventId: job.data.eventId,
      url: job.data.subscriberUrl,
      payload: job.data.payload,
      error: err.message,
      failedAt: new Date()
    };

    await connection.lpush('deadLetterQueue', JSON.stringify(dlqData));
    await Event.findOneAndUpdate({ eventId: job.data.eventId }, { status: 'failed', retries: attemptCount });
  }
});

module.exports = webhookWorker;
