'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface WeatherData {
    city: string;
    temperature: number;
    windSpeed: number;
    lastUpdated: string;
}

export default function WeatherPage() {
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeatherData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/weather');
            const data = await response.json();
            
            if (data.success && data.data) {
                setWeatherData(data.data);
                setLastSync(data.lastSync ? new Date(data.lastSync).toLocaleString() : null);
            } else {
                setError(data.error || 'Failed to fetch weather data');
            }
        } catch (err) {
            console.error('Error fetching weather data:', err);
            setError('Failed to fetch weather data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherData();
        // Refresh data every 10 seconds
        const interval = setInterval(fetchWeatherData, 10000);
        return () => clearInterval(interval);
    }, []);

    const getWeatherIcon = (temperature: number) => {
        if (temperature >= 25) {
            return <Sun className="h-5 w-5 text-amber-400" />;
        } else if (temperature >= 15) {
            return <Cloud className="h-5 w-5 text-gray-400" />;
        } else {
            return <CloudRain className="h-5 w-5 text-blue-400" />;
        }
    };

    // Ensure we have data for all 4 cities, even if not in database
    const standardCities = ['London', 'New York', 'Tokyo', 'Cairo'];
    const cityDataMap = new Map(weatherData.map(item => [item.city, item]));
    
    const displayData = standardCities.map(city => {
        const data = cityDataMap.get(city);
        return data || {
            city,
            temperature: 0,
            windSpeed: 0,
            lastUpdated: 'N/A',
        };
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Navigation */}
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Weather Data</h1>
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {loading && weatherData.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading weather data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchWeatherData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Weather Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                City Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Temperature
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Wind Speed
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {displayData.map((data, index) => (
                                            <tr
                                                key={data.city}
                                                className={`transition-colors duration-150 hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {getWeatherIcon(data.temperature)}
                                                        <span className="text-sm font-medium text-gray-900">{data.city}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                    {data.temperature !== null && data.temperature !== undefined ? `${data.temperature}°C` : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                    {data.windSpeed != null ? `${data.windSpeed} km/h` : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {data.lastUpdated !== 'N/A' 
                                                        ? new Date(data.lastUpdated).toLocaleString()
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Last Sync Timestamp */}
                        {lastSync && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Last sync at <span className="font-medium text-gray-900">{lastSync}</span>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
