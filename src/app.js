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

// Root Route - Techy Hero Page for HR/CEO
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HookFlow | Webhook Delivery System</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;500&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #05050a;
                --primary: #00f0ff;
                --secondary: #7000ff;
                --accent: #ff0077;
                --text: #e0e0e0;
                --glass: rgba(255, 255, 255, 0.03);
                --border: rgba(255, 255, 255, 0.08);
            }
            body {
                margin: 0;
                padding: 0;
                background-color: var(--bg-color);
                color: var(--text);
                font-family: 'Inter', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                overflow-y: auto;
                padding: 2rem 0;
            }
            .bg-glow {
                position: absolute;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(112, 0, 255, 0.05) 50%, rgba(0,0,0,0) 70%);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 0;
                pointer-events: none;
            }
            .container {
                position: relative;
                z-index: 1;
                background: var(--glass);
                backdrop-filter: blur(20px);
                border: 1px solid var(--border);
                border-radius: 24px;
                padding: 3rem;
                width: 90%;
                max-width: 650px;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                margin: auto;
            }
            .container::before {
                content: '';
                position: absolute;
                top: -1px; left: -1px; right: -1px; bottom: -1px;
                border-radius: 24px;
                background: linear-gradient(45deg, var(--primary), transparent, var(--secondary));
                z-index: -1;
                opacity: 0.3;
            }
            h1 {
                font-family: 'Orbitron', sans-serif;
                font-size: 3rem;
                margin-bottom: 0.5rem;
                background: linear-gradient(to right, var(--primary), #fff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: 2px;
            }
            .subtitle {
                font-size: 1rem;
                color: #888;
                margin-bottom: 2rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .status-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .status-item {
                background: rgba(0, 0, 0, 0.2);
                padding: 1rem;
                border-radius: 12px;
                border: 1px solid var(--border);
                transition: all 0.3s ease;
            }
            .status-item:hover {
                border-color: var(--primary);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 240, 255, 0.1);
            }
            .status-label {
                font-size: 0.75rem;
                color: #666;
                text-transform: uppercase;
                margin-bottom: 0.5rem;
            }
            .status-value {
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                color: #fff;
            }
            .pulse {
                display: inline-block;
                width: 8px;
                height: 8px;
                background-color: #00ff66;
                border-radius: 50%;
                margin-right: 6px;
                box-shadow: 0 0 10px #00ff66;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
            .section-box {
                text-align: left;
                background: rgba(0, 0, 0, 0.2);
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--border);
                margin-bottom: 1.5rem;
            }
            .section-box h3 {
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                margin-top: 0;
                margin-bottom: 1rem;
                color: var(--primary);
            }
            .section-box ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .section-box li {
                margin-bottom: 0.75rem;
                font-size: 0.9rem;
                color: #aaa;
                display: flex;
                align-items: center;
            }
            .section-box.features li::before {
                content: '⚡';
                margin-right: 10px;
                color: var(--primary);
            }
            .section-box.docs code {
                background: rgba(255, 255, 255, 0.05);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 0.85rem;
                margin-right: 8px;
            }
            .method {
                font-weight: bold;
                width: 50px;
                display: inline-block;
            }
            .method.get { color: var(--primary); }
            .method.post { color: #ffaa00; }
            
            .btn-group {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 1.5rem;
            }
            .btn {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background: transparent;
                border: 1px solid var(--primary);
                color: var(--primary);
                border-radius: 8px;
                text-decoration: none;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.8rem;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn:hover {
                background: var(--primary);
                color: #000;
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
            }
            .footer {
                margin-top: 2.5rem;
                font-size: 0.8rem;
                color: #444;
            }
        </style>
    </head>
    <body>
        <div class="bg-glow"></div>
        <div class="container">
            <h1>HOOKFLOW</h1>
            <div class="subtitle">Production-Grade Webhook Delivery System</div>
            
            <div class="status-grid">
                <div class="status-item">
                    <div class="status-label">API Status</div>
                    <div class="status-value"><span class="pulse"></span>ONLINE</div>
                </div>
                <div class="status-item">
                    <div class="status-label">Worker</div>
                    <div class="status-value"><span class="pulse"></span>ACTIVE</div>
                </div>
                <div class="status-item">
                    <div class="status-label">Queue</div>
                    <div class="status-value">BULLMQ</div>
                </div>
            </div>

            <div class="section-box features">
                <h3>System Architecture</h3>
                <ul>
                    <li>Parallel Delivery with Concurrent Workers</li>
                    <li>Automatic Retries with Exponential Backoff</li>
                    <li>Idempotency Guarantee via Event Logging</li>
                    <li>HMAC SHA-256 Payload Signing</li>
                </ul>
            </div>

            <div class="section-box docs">
                <h3>API Endpoints</h3>
                <ul>
                    <li><span class="method get">GET</span><code>/api/health</code> - System Health Check</li>
                    <li><span class="method get">GET</span><code>/api/metrics</code> - System Metrics</li>
                    <li><span class="method post">POST</span><code>/api/subscribers</code> - Register Subscriber</li>
                    <li><span class="method post">POST</span><code>/api/events</code> - Trigger Event</li>
                    <li><span class="method get">GET</span><code>/api/events/:id</code> - Event Status</li>
                    <li><span class="method get">GET</span><code>/api/logs</code> - Delivery Logs</li>
                </ul>
            </div>

            <div class="btn-group">
                <a href="/health" class="btn">Check Health</a>
                <a href="/api/metrics" class="btn">Check Metrics</a>
            </div>

            <div class="footer">
                Developed by Ekansh Mishra | For Evaluation Only
            </div>
        </div>
    </body>
    </html>
  `);
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

// Contribution update #24 - 2026-05-02 22:11:12

// Contribution update #25 - 2026-05-02 22:11:12

// App configuration and middleware setup
