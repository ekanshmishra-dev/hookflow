const { v4: uuidv4 } = require('uuid');
const Subscriber = require('../models/Subscriber');
const Event = require('../models/Event');
const EventLog = require('../models/EventLog');
const webhookQueue = require('../queue/webhookQueue');

/**
 * Receives an incoming event and queues it for delivery to subscribers.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.receiveEvent = async (req, res) => {
  try {
    const { eventType, payload } = req.body;
    
    // Optional duplicate prevention via header
    const idempotencyKey = req.headers['x-idempotency-key'];

    if (!eventType || !payload) {
      return res.status(400).json({ error: 'eventType and payload are required' });
    }

    // Check idempotency if key provided
    if (idempotencyKey) {
      const existingEvent = await Event.findOne({ idempotencyKey });
      if (existingEvent) {
        return res.status(200).json({ 
          message: 'Duplicate event ignored',
          eventId: existingEvent.eventId
        });
      }
    }

    // Generate internal unique event ID
    const eventId = uuidv4();

    // Create main Event record
    const newEvent = new Event({
      eventId,
      idempotencyKey,
      eventType,
      payload
    });

    // Find all subscribers for this event type
    const subscribers = await Subscriber.find({ eventType });

    if (subscribers.length === 0) {
      await newEvent.save();
      return res.status(200).json({ 
        message: 'Event accepted',
        eventId
      });
    }

    // Process event for all subscribers
    const jobs = [];
    const eventLogs = [];

    for (const sub of subscribers) {
      // Create a pending event log for each subscriber
      const log = new EventLog({
        eventId,
        eventType,
        payload,
        status: 'pending',
        subscriberUrl: sub.url
      });
      eventLogs.push(log);

      // Add to BullMQ queue
      jobs.push({
        name: 'webhook',
        data: {
          eventId,
          eventType,
          payload,
          subscriberUrl: sub.url
        }
      });
    }

    // Save main event, then all logs
    await newEvent.save();
    await EventLog.insertMany(eventLogs);

    // Push all jobs to queue
    await webhookQueue.addBulk(jobs);

    return res.status(202).json({
      message: 'Event accepted',
      eventId,
      queuedDeliveries: jobs.length
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ error: 'Event already processed (idempotency conflict)' });
    }
    console.error('[Event Controller] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves the delivery status and logs for a specific event.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;

    const logs = await EventLog.find({ eventId }).sort({ deliveredAt: -1 });
    
    // Compute status from logs
    let status = 'pending';
    if (logs.length > 0) {
      const hasSuccess = logs.some(l => l.status === 'success');
      status = hasSuccess ? 'success' : 'failed';
    }

    return res.status(200).json({
      eventId,
      status,
      attempts: logs.length,
      logs: logs.map(l => ({
        url: l.url,
        status: l.status,
        responseCode: l.responseCode,
        error: l.error,
        deliveredAt: l.deliveredAt
      }))
    });
  } catch (error) {
    console.error('[Event Controller] getEventStatus Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves the list of failed deliveries from the Dead Letter Queue.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDeadLetterQueue = async (req, res) => {
  try {
    const connection = require('../queue/connection');
    const failedJobs = await connection.lrange('deadLetterQueue', 0, -1);
    const parsedJobs = failedJobs.map(job => JSON.parse(job));

    return res.status(200).json({
      total: parsedJobs.length,
      jobs: parsedJobs
    });
  } catch (error) {
    console.error('[Event Controller] getDeadLetterQueue Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
