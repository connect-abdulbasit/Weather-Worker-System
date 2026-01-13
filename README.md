# Weather Worker System

A full-stack weather data fetching system built with Next.js, Redis, PostgreSQL, and TypeScript. This system demonstrates a producer-consumer architecture with automated scheduling, job queuing, and real-time weather data updates.

## 📦 Deliverables

This repository contains all required components:

- **`/app`** → Next.js frontend + API routes
- **`/worker`** → TypeScript consumer service
- **`/producer`** → TypeScript scheduler service
- **`/docker-compose.yml`** → Container orchestration
- **`/README.md`** → Setup and usage instructions (this file)

### Quick Start

**Running the system locally requires only:**

```bash
docker compose up --build
```

That's it! The entire system will start automatically.

## 🎯 Overview

This system automatically fetches weather data for four major cities (London, New York, Tokyo, Cairo) using the Open-Meteo API. It features:

- **Redis-based job queuing** for asynchronous task processing
- **Automated background scheduling** that enqueues jobs every 60 seconds
- **Real-time weather data** from external APIs
- **PostgreSQL persistence** for weather records and job history
- **Modern Next.js frontend** with beautiful UI
- **Fully containerized** with Docker Compose

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐
│   Next.js   │────────▶│    Redis    │
│   (App)     │  POST   │   (Queue)   │
└─────────────┘         └─────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Producer   │      │   Worker    │      │ PostgreSQL  │
│ (Scheduler) │      │ (Consumer)  │      │  (Database) │
│             │      │             │      │             │
│ Every 60s   │      │ Fetches     │      │ Stores      │
│ enqueues    │      │ Weather     │      │ Weather     │
│ job         │      │ Data        │      │ Data        │
└─────────────┘      └─────────────┘      └─────────────┘
```

### System Components

1. **Next.js App** (`/app`)
   - Frontend dashboard and weather data display
   - API routes for job management and weather data retrieval
   - Port: `3000`

2. **Producer Service** (`/producer`)
   - Automated scheduler that enqueues weather jobs every 60 seconds
   - TypeScript-based Node.js service

3. **Worker Service** (`/worker`)
   - Consumes jobs from Redis queue
   - Fetches weather data from Open-Meteo API
   - Upserts data into PostgreSQL

4. **Redis** (`redis:7`)
   - Central job queue for all services
   - Port: `6379`

5. **PostgreSQL** (`postgres:15`)
   - Stores weather data and job history
   - Port: `5432`
   - Auto-initialized with schema on first run

## ✨ Features

- 🎨 **Modern UI** with Tailwind CSS and gradient designs
- 📊 **Real-time Dashboard** showing job statistics and history
- 🌍 **Weather Data Table** displaying temperature, wind speed, and timestamps
- ⚡ **Automated Scheduling** - jobs enqueued every 60 seconds
- 🔄 **Manual Job Trigger** - fetch weather on-demand
- 📈 **Job History Tracking** - monitor all job executions
- 🐳 **Dockerized** - single command to run entire system
- 🔒 **Type-Safe** - full TypeScript implementation

## 📋 Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

That's it! No need to install Node.js, PostgreSQL, or Redis locally.

## 🚀 Quick Start

### Prerequisites
- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Weather-Worker-System
   ```

2. **Start the entire system** (single command)
   ```bash
   docker compose up --build
   ```

   This single command will:
   - Build all Docker images
   - Initialize PostgreSQL database with required schema
   - Start Redis server
   - Launch the Next.js app (frontend + API)
   - Start the producer scheduler (enqueues jobs every 60 seconds)
   - Start the worker service (processes jobs from queue)

3. **Access the application**
   - **Dashboard**: http://localhost:3000
   - **Weather Data**: http://localhost:3000/weather

**No additional setup required!** All dependencies are containerized.

## 📁 Project Structure

The repository contains all required deliverables:

```
Weather-Worker-System/
├── app/                    # ✅ Next.js frontend + API
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── job/       # Job management endpoints
│   │   │   └── weather/  # Weather data endpoints
│   │   ├── weather/       # Weather data page
│   │   └── page.tsx       # Dashboard page
│   ├── lib/               # Database and Redis clients
│   └── Dockerfile
├── producer/               # ✅ TypeScript scheduler service
│   ├── src/
│   │   └── index.ts       # Producer logic
│   └── Dockerfile
├── worker/                # ✅ TypeScript consumer service
│   ├── src/
│   │   └── index.ts      # Worker logic
│   └── Dockerfile
├── postgres/
│   └── init.sql          # Database schema initialization
├── docker-compose.yml     # ✅ Container orchestration
└── README.md              # ✅ Setup and usage instructions
```

## 🔌 API Endpoints

### POST `/api/job`
Enqueues a new weather fetching job.

**Request:**
```bash
curl -X POST http://localhost:3000/api/job
```

**Response:**
```json
{
  "success": true,
  "jobId": "job-123e4567-e89b-12d3-a456-426614174000",
  "message": "Weather fetching job enqueued successfully"
}
```

### GET `/api/job`
Retrieves recent job history.

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job-123e4567-e89b-12d3-a456-426614174000",
      "status": "success",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET `/api/weather`
Retrieves all stored weather data for the four standard cities.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "city": "London",
      "temperature": 15.5,
      "windSpeed": 12.3,
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    }
  ],
  "lastSync": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Environment Variables

All services use environment variables configured in `docker-compose.yml`:

### App Service
- `POSTGRES_HOST=postgres`
- `POSTGRES_PORT=5432`
- `POSTGRES_DB=weather`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `REDIS_URL=redis://redis:6379`

### Producer Service
- `REDIS_URL=redis://redis:6379`
- `QUEUE_NAME=weather:jobs`
- `INTERVAL_SECONDS=60`
- `POSTGRES_HOST=postgres`
- `POSTGRES_PORT=5432`
- `POSTGRES_DB=weather`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`

### Worker Service
- `REDIS_URL=redis://redis:6379`
- `QUEUE_NAME=weather:jobs`
- `POSTGRES_HOST=postgres`
- `POSTGRES_PORT=5432`
- `POSTGRES_DB=weather`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `OPEN_METEO_URL=https://api.open-meteo.com/v1/forecast`

## 🛠️ Technologies Used

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **Tailwind CSS 4** - Styling framework
- **lucide-react** - Icon library

### Backend
- **Node.js** - Runtime environment
- **TypeScript 5** - Type-safe development
- **PostgreSQL 15** - Relational database
- **Redis 7** - In-memory data store and job queue

### Libraries
- **pg** - PostgreSQL client
- **redis** - Redis client
- **axios** - HTTP client for API requests
- **uuid** - Unique identifier generation
- **tsx** - TypeScript execution

## 🔄 How It Works

### 1. Manual Job Creation
- User clicks "Fetch Weather Now" on the dashboard
- Next.js app calls `POST /api/job`
- Job is enqueued in Redis
- Job record is created in PostgreSQL with `pending` status

### 2. Automated Job Creation
- Producer service runs every 60 seconds
- Automatically enqueues a job with the four standard cities
- Job is added to Redis queue

### 3. Job Processing
- Worker service continuously polls Redis queue
- When a job is found:
  1. Updates job status to `pending`
  2. Fetches weather data from Open-Meteo API for each city
  3. Upserts data into PostgreSQL (one record per city)
  4. Updates job status to `success` or `failed`

### 4. Data Display
- Weather page fetches data via `GET /api/weather`
- Displays table with latest weather information
- Shows "Last sync at [timestamp]" below the table

## 📊 Database Schema

### `weather_data` Table
Stores weather information for each city (one record per city).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `city` | VARCHAR(100) | City name (UNIQUE) |
| `temperature` | DECIMAL(5,2) | Temperature in Celsius |
| `wind_speed` | DECIMAL(5,2) | Wind speed in km/h |
| `observed_at` | TIMESTAMP | When weather was observed |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time (auto-updated) |

### `job_history` Table
Tracks all job executions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `job_id` | VARCHAR(100) | Unique job identifier (UNIQUE) |
| `status` | VARCHAR(20) | Job status: `pending`, `success`, `failed` |
| `created_at` | TIMESTAMP | Job creation time |
| `completed_at` | TIMESTAMP | Job completion time |

## 🎨 UI Pages

### Dashboard (`/`)
- **Fetch Weather Now** button - manually trigger a job
- **Statistics Cards** - Total, Successful, Pending, Failed jobs
- **Job History Table** - Recent job executions with status badges

### Weather Data (`/weather`)
- **Weather Data Table** - Shows all four cities with:
  - City name with weather icon
  - Temperature (color-coded: red=hot, orange=warm, blue=cold)
  - Wind speed
  - Last updated timestamp
- **Last Sync** - Timestamp showing when database was last updated

## 🐳 Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| `app` | `weather_app` | 3000 | Next.js frontend and API |
| `producer` | `weather_producer` | - | Background scheduler |
| `worker` | `weather_worker` | - | Job consumer |
| `redis` | `weather_redis` | 6379 | Redis server |
| `postgres` | `weather_postgres` | 5432 | PostgreSQL database |

## 🛑 Stopping the System

Press `Ctrl+C` in the terminal, or run:

```bash
docker compose down
```

To remove volumes (clears database data):

```bash
docker compose down -v
```

## 🔍 Troubleshooting

### Services won't start
- Ensure Docker and Docker Compose are installed and running
- Check if ports 3000, 5432, and 6379 are available
- View logs: `docker compose logs [service-name]`

### Database connection errors
- Wait a few seconds for PostgreSQL to fully initialize
- Check logs: `docker compose logs postgres`
- Verify environment variables in `docker-compose.yml`

### Jobs not processing
- Check worker logs: `docker compose logs worker`
- Verify Redis is running: `docker compose logs redis`
- Ensure queue name matches in all services

### No weather data displayed
- Check if jobs are being created: `docker compose logs producer`
- Verify worker is processing jobs: `docker compose logs worker`
- Check API response: `curl http://localhost:3000/api/weather`

## 📝 Development

### Running services individually

**Next.js app:**
```bash
cd app
npm install
npm run dev
```

**Producer:**
```bash
cd producer
npm install
npm start
```

**Worker:**
```bash
cd worker
npm install
npm start
```

### Database Access

Connect to PostgreSQL:
```bash
docker exec -it weather_postgres psql -U postgres -d weather
```

View tables:
```sql
\dt
SELECT * FROM weather_data;
SELECT * FROM job_history ORDER BY created_at DESC LIMIT 10;
```

### Redis Access

Connect to Redis CLI:
```bash
docker exec -it weather_redis redis-cli
```

View queue:
```bash
LLEN weather:jobs
LRANGE weather:jobs 0 -1
```

## 📄 License

This project is for educational purposes.

## 👤 Author

Weather Worker System - Full-stack demonstration project

---