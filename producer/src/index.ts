import { createClient } from 'redis'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid';
import {Pool} from 'pg';

dotenv.config()

interface CityMetadata {
    name: string;
    latitude: number;
    longitude: number;
}

interface JobPayLoad {
    id: string;
    type: 'fetch-weather';
    cities: CityMetadata[];
    createdAt: string;
}

interface EnvConfig {
    redisUrl: string;
    queueName: string;
    intervalSeconds: number;
    postgresHost: string;
    postgresPort: number;
    postgresDb: string;
    postgresUser: string;
    postgresPassword: string;
}

const config: EnvConfig = {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    queueName: process.env.QUEUE_NAME || 'weather:jobs',
    intervalSeconds: parseInt(process.env.INTERVAL_SECONDS || '60'),
    postgresHost: process.env.POSTGRES_HOST || 'localhost',
    postgresPort: parseInt(process.env.POSTGRES_PORT || '5432'),
    postgresDb: process.env.POSTGRES_DB || 'weather',
    postgresUser: process.env.POSTGRES_USER || 'postgres',
    postgresPassword: process.env.POSTGRES_PASSWORD || 'postgres',
}

const pool = new Pool({
    host: config.postgresHost,
    port: config.postgresPort,
    database: config.postgresDb,
    user: config.postgresUser,
    password: config.postgresPassword,
});

const STANDARD_CITIES: CityMetadata[] = [
    { name: 'London', latitude: 51.5072, longitude: -0.1276 },
    { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
    { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
    { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
];

const redisClient = createClient({
    url: config.redisUrl,
})

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
    process.exit(1);
})

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
})

function generateJobId(): string {
    return `job-${uuidv4()}`;
}

async function enqueueJob(): Promise<void> {
    try {
        const jobId = generateJobId();

        const job: JobPayLoad = {
            id: jobId,
            type: 'fetch-weather',
            cities: STANDARD_CITIES,
            createdAt: new Date().toISOString(),
        }
        await redisClient.lPush(config.queueName, JSON.stringify(job));

        await pool.query(
            'INSERT INTO job_history (job_id, status) VALUES ($1, $2) ON CONFLICT (job_id) DO NOTHING',
            [jobId, 'pending']
        );
        console.log(`Job ${jobId} enqueued successfully`);

    } catch (error) {
        throw error;
    }
}

async function startScheduler(): Promise<void> {
    try {

        await redisClient.connect();
        await pool.query('SELECT 1'); 
        console.log('✅ Connected to Redis and PostgreSQL');

        await enqueueJob();
        setInterval(async () => {
            try {
                await enqueueJob();
            } catch (error) {
                console.error('Error enqueuing job:', error);
            }

        }, config.intervalSeconds * 1000);

    } catch (error) {
        console.error('Error starting scheduler:', error);
        process.exit(1);
    }
}

startScheduler().catch((error) => {
    console.error('Error starting scheduler:', error);
    process.exit(1);
});