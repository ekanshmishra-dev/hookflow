const Event = require('../models/Event');
const EventLog = require('../models/EventLog');
const Subscriber = require('../models/Subscriber');
const webhookQueue = require('../queue/webhookQueue');

exports.getMetrics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalSubscribers = await Subscriber.countDocuments();
    
    // Aggregated stats from logs
    const successLogs = await EventLog.countDocuments({ status: 'success' });
    const failedLogs = await EventLog.countDocuments({ status: 'failed' });
    
    // Queue stats
    const jobCounts = await webhookQueue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');

    return res.status(200).json({
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      },
      database: {
        totalEvents,
        totalSubscribers,
        deliveryStats: {
          success: successLogs,
          failed: failedLogs,
          totalAttempts: successLogs + failedLogs
        }
      },
      queue: jobCounts
    });
  } catch (error) {
    console.error('[Metrics Controller] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
