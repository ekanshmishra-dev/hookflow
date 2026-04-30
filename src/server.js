require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hookflow';

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log(`[Server] Connected to MongoDB at ${MONGODB_URI}`);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`[Server] HookFlow API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

startServer();
