require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hookflow';

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB', { uri: MONGODB_URI });

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`HookFlow API listening on port ${PORT}`);
    });

    // Start worker in the same process if on Render (Free tier workaround)
    if (process.env.RENDER === 'true') {
      logger.info('Starting Webhook Worker in the same process (Render environment)...');
      require('./workers/webhookWorker');
      logger.info('Webhook worker started successfully in server process.');
    }
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

// Entry point for the application
