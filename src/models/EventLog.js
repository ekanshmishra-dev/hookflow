const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  attempts: {
    type: Number,
    default: 1
  },
  responseCode: {
    type: Number
  },
  error: {
    type: String
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EventLog', eventLogSchema);
