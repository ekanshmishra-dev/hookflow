const Subscriber = require('../models/Subscriber');

/**
 * Handles new subscriber registrations.
 * Checks for existing subscriptions and creates a new one if it doesn't exist.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.subscribe = async (req, res) => {
  try {
    const { url, eventType } = req.body;

    if (!url || !eventType) {
      return res.status(400).json({ error: 'url and eventType are required' });
    }

    // Try to find an existing subscription
    let subscriber = await Subscriber.findOne({ url, eventType });

    if (subscriber) {
      return res.status(200).json({ 
        message: 'Already subscribed',
        subscriber 
      });
    }

    // Create a new subscription
    subscriber = new Subscriber({ url, eventType });
    await subscriber.save();

    return res.status(201).json({
      message: 'Successfully subscribed',
      subscriber
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ error: 'Already subscribed' });
    }
    console.error('[Subscriber Controller] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
