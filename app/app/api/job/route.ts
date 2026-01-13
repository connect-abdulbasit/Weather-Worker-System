import { NextResponse } from 'next/server';
import { getRedisClient, WEATHER_QUEUE } from '@/lib/redis';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        job_id as id,
        status,
        created_at as timestamp
      FROM job_history
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const jobs = result.rows.map((row: { id: string; status: string; timestamp: Date }) => ({
      id: row.id,
      status: row.status,
      timestamp: new Date(row.timestamp).toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        jobs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching job history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job history',
        message: error instanceof Error ? error.message : 'Unknown error',
        jobs: [],
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const redis = await getRedisClient();
    
    const jobId =  `job-${uuidv4()}`;
  
    const STANDARD_CITIES = [
      { name: 'London', latitude: 51.5072, longitude: -0.1276 },
      { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
      { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
      { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
    ];

    const job = {
      id: jobId,
      type: 'fetch-weather',
      cities: STANDARD_CITIES, 
      createdAt: new Date().toISOString(),
    };

    await redis.lPush(WEATHER_QUEUE, JSON.stringify(job));

    await pool.query(
      'INSERT INTO job_history (job_id, status) VALUES ($1, $2) ON CONFLICT (job_id) DO NOTHING',
      [jobId, 'pending']
    );

    return NextResponse.json(
      {
        success: true,
        jobId,
        message: 'Weather fetching job enqueued successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error enqueueing job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enqueue job',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
