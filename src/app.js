const express = require('express');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to all requests
app.use(limiter);

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[App] Global Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

// Contribution update #1 - 2026-05-02 22:11:04

// Contribution update #2 - 2026-05-02 22:11:04

// Contribution update #3 - 2026-05-02 22:11:05

// Contribution update #4 - 2026-05-02 22:11:05

// Contribution update #5 - 2026-05-02 22:11:05

// Contribution update #6 - 2026-05-02 22:11:06

// Contribution update #7 - 2026-05-02 22:11:06

// Contribution update #8 - 2026-05-02 22:11:06

// Contribution update #9 - 2026-05-02 22:11:06

// Contribution update #10 - 2026-05-02 22:11:07

// Contribution update #11 - 2026-05-02 22:11:07

// Contribution update #12 - 2026-05-02 22:11:07

// Contribution update #13 - 2026-05-02 22:11:07

// Contribution update #14 - 2026-05-02 22:11:08

// Contribution update #15 - 2026-05-02 22:11:08

// Contribution update #16 - 2026-05-02 22:11:09

// Contribution update #17 - 2026-05-02 22:11:09

// Contribution update #18 - 2026-05-02 22:11:09

// Contribution update #19 - 2026-05-02 22:11:10

// Contribution update #20 - 2026-05-02 22:11:10

// Contribution update #21 - 2026-05-02 22:11:11

// Contribution update #22 - 2026-05-02 22:11:11

// Contribution update #23 - 2026-05-02 22:11:11
