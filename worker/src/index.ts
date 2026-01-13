import {createClient} from 'redis'
import * as dotenv from 'dotenv'
import axios from 'axios';
import { Pool } from 'pg';

dotenv.config()
interface CityMetadata {
    name: string;
    latitude: number;
    longitude: number;
  }
  
  interface JobPayload {
    id: string;
    type: 'fetch-weather';
    cities: CityMetadata[];
    createdAt: string;
  }
  
  interface OpenMeteoCurrent {
    temperature_2m: number;
    windspeed_10m: number;
    time: string;
    interval: string;
  }
  
  interface OpenMeteoResponse {
    current: OpenMeteoCurrent;
  }
  
  interface WeatherData {
    city: string;
    temperature: number;
    windSpeed: number;
    lastUpdated: Date;
  }
  
  interface EnvConfig {
    redisUrl: string;
    queueName: string;
    postgresHost: string;
    postgresPort: number;
    postgresDb: string;
    postgresUser: string;
    postgresPassword: string;
    openMeteoUrl: string;
  }

  const config: EnvConfig = {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    queueName: process.env.QUEUE_NAME || 'weather:jobs',
    postgresHost: process.env.POSTGRES_HOST || 'localhost',
    postgresPort: parseInt(process.env.POSTGRES_PORT || '5432'),
    postgresDb: process.env.POSTGRES_DB || 'weather',
    postgresUser: process.env.POSTGRES_USER || 'postgres',
    postgresPassword: process.env.POSTGRES_PASSWORD || 'postgres',
    openMeteoUrl: process.env.OPEN_METEO_URL || 'https://api.open-meteo.com/v1/forecast',
  }
  const pool = new Pool({
    host: config.postgresHost,
    port: config.postgresPort,
    database: config.postgresDb,
    user: config.postgresUser,
    password: config.postgresPassword,
  })

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

async function updateJobStatus(jobId: string, status: 'pending' | 'success' | 'failed'): Promise<void> {
    try {
        if (status === 'success' || status === 'failed') {
            await pool.query(
                `UPDATE job_history 
                 SET status = $1, completed_at = CURRENT_TIMESTAMP 
                 WHERE job_id = $2`,
                [status, jobId]
            );
        } else {
            await pool.query(
                `INSERT INTO job_history (job_id, status) 
                 VALUES ($1, $2) 
                 ON CONFLICT (job_id) DO UPDATE SET status = $2`,
                [jobId, status]
            );
        }
    } catch (error) {
        console.error(`Error updating job status for ${jobId}:`, error);
    }
}

async function startWorker(): Promise<void>{
    try{
        await redisClient.connect();
        await pool.query('SELECT 1');
        console.log('✅ Connected to Redis and PostgreSQL');

        while(true){
            try {
                const result = await redisClient.brPop(
                    config.queueName,
                    5
                );
                
                if(result){
                    const jobData = JSON.parse(result.element) as JobPayload;
                    console.log(`🔄 Processing job ${jobData.id}`);
                    
                    await updateJobStatus(jobData.id, 'pending');
                    
                    let allCitiesSuccess = true;
                    
                    for(const city of jobData.cities){
                        if (!city.latitude || !city.longitude) {
                            console.error(`❌ Invalid city data:`, city);
                            allCitiesSuccess = false;
                            continue;
                        }
                        
                        try {
                            const url = `${config.openMeteoUrl}?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,windspeed_10m`;
                            const response = await axios.get<OpenMeteoResponse>(url);
                            const data = response.data;
                            console.log(data.current.time);
                            await pool.query(
                                `INSERT INTO weather_data (city, temperature, wind_speed, observed_at) 
                                 VALUES ($1, $2, $3, $4)
                                 ON CONFLICT (city)
                                 DO UPDATE SET 
                                     temperature = EXCLUDED.temperature,
                                     wind_speed = EXCLUDED.wind_speed,
                                     observed_at = EXCLUDED.observed_at`,
                                [city.name, data.current.temperature_2m, data.current.windspeed_10m, new Date(data.current.time).toISOString()]
                            );
                            console.log(`✅ Processed ${city.name}`);
                        } catch (cityError) {
                            console.error(`❌ Error processing ${city.name}:`, cityError);
                            allCitiesSuccess = false;
                        }
                    }
                    
                    await updateJobStatus(jobData.id, allCitiesSuccess ? 'success' : 'failed');
                    console.log(`✅ Completed job ${jobData.id} with status: ${allCitiesSuccess ? 'success' : 'failed'}`);
                }
            } catch (error) {
                console.error('❌ Error processing job:', error);
            }
        }
    } catch (error) {
        console.error('❌ Fatal error in worker:', error);
        throw error;
    }
}

startWorker().catch((error) => {
    console.error('Error starting worker:', error);
    process.exit(1);
});