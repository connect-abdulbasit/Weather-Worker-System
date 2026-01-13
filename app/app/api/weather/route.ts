import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        city,
        temperature,
        wind_speed,
        observed_at,
        updated_at
      FROM weather_data
      WHERE city IN ('London', 'New York', 'Tokyo', 'Cairo')
      ORDER BY 
        CASE city
          WHEN 'London' THEN 1
          WHEN 'New York' THEN 2
          WHEN 'Tokyo' THEN 3
          WHEN 'Cairo' THEN 4
        END
    `);

    // Use updated_at for "last sync" (when DB was last updated)
    const syncResult = await pool.query(`
      SELECT MAX(updated_at) as last_sync
      FROM weather_data
      WHERE city IN ('London', 'New York', 'Tokyo', 'Cairo')
    `);

    const weatherData = result.rows.map((row: { 
      city: string; 
      temperature: string; 
      wind_speed: string; 
      observed_at: Date;
      updated_at: Date;
    }) => ({
      city: row.city,
      temperature: parseFloat(row.temperature),
      windSpeed: parseFloat(row.wind_speed),
      lastUpdated: new Date(row.observed_at).toISOString(), // Weather observation time
    }));

    const lastSync = syncResult.rows[0]?.last_sync
      ? new Date(syncResult.rows[0].last_sync).toISOString()
      : null;

    return NextResponse.json(
      {
        success: true,
        data: weatherData,
        lastSync,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
