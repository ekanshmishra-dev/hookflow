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

    const mem = process.memoryUsage();
    const formattedMemory = {
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`
    };

    return res.status(200).json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      system: {
        uptime: `${Math.floor(process.uptime())} seconds`,
        memoryUsage: formattedMemory
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
