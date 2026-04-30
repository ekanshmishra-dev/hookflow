# HookFlow 🚀

HookFlow is a production-ready webhook delivery system built with Node.js, Express, MongoDB, Redis, and BullMQ. It allows you to reliably receive events and broadcast them to registered subscribers with automatic retries and exponential backoff.

## Features
- **Idempotency**: Prevents duplicate processing of the same event using an `x-idempotency-key` header.
- **Reliability**: Uses BullMQ for reliable queueing and background processing.
- **Retry Logic**: Automatically retries failed webhook deliveries up to 5 times with exponential backoff.
- **Delivery Logging**: Stores the delivery status (`pending`, `success`, `failed`), retry counts, and payloads in MongoDB.
- **Rate Limiting**: Protects your endpoints from abuse.

## Prerequisites
- **Node.js**: v14+
- **MongoDB**: Running on default port `27017`
- **Redis**: Running on default port `6379`

## Setup Instructions

1. **Clone/Download the repository**
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup**
   Copy `.env.example` to `.env` and adjust the variables if your MongoDB or Redis instances are hosted remotely:
   ```bash
   cp .env.example .env
   ```
4. **Start the Database & Redis**
   Ensure your local MongoDB server and Redis server are running.

5. **Start the API Server**
   ```bash
   npm start
   # Or for development with auto-restart:
   npm run dev
   ```

6. **Start the Background Worker** (in a separate terminal)
   ```bash
   npm run start:worker
   # Or for development:
   npm run dev:worker
   ```

## API Endpoints

### 1. Register a Subscriber
Registers a URL to listen for a specific event type.
- **Method**: `POST /api/subscribe`
- **Body**:
  ```json
  {
    "url": "https://webhook.site/your-unique-id",
    "eventType": "user.created"
  }
  ```

### 2. Publish an Event
Sends an event to the system. HookFlow will queue it and push it to all relevant subscribers.
- **Method**: `POST /api/events`
- **Headers**: 
  - `x-idempotency-key`: `some-unique-string` (Optional, but highly recommended to prevent duplicate processing)
- **Body**:
  ```json
  {
    "eventType": "user.created",
    "payload": {
      "id": 123,
      "email": "test@example.com",
      "name": "John Doe"
    }
  }
  ```

### 3. View Event Logs
View the status of processed events (Bonus Feature).
- **Method**: `GET /api/logs`
- **Query Params**:
  - `limit`: number (default: 50)
  - `page`: number (default: 1)
  - `status`: string (e.g., "success", "failed", "pending")
  - `eventId`: string

## How Retry Works
HookFlow uses [BullMQ](https://docs.bullmq.io/) under the hood. When the worker picks up a job, it attempts to send an HTTP POST request to the subscriber's URL.
- If the request returns a 2xx status, it's marked as `success` in the database.
- If the request times out or returns a non-2xx status, it throws an error and BullMQ automatically schedules a retry.
- Retries use an **exponential backoff** strategy (e.g., 2s, 4s, 8s, 16s, etc.).
- After 5 unsuccessful attempts, the job is marked as `failed` permanently in the database for manual review.
