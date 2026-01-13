'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Loader2, ArrowLeft, Wind, RefreshCw } from 'lucide-react';
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
        } catch {
            setError('Failed to fetch weather data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherData();
        const interval = setInterval(fetchWeatherData, 10000);
        return () => clearInterval(interval);
    }, []);

    const getWeatherIcon = (temperature: number) => {
        if (temperature >= 25) {
            return <Sun className="h-6 w-6 text-amber-500 animate-pulse" />;
        } else if (temperature >= 15) {
            return <Cloud className="h-6 w-6 text-gray-500" />;
        } else {
            return <CloudRain className="h-6 w-6 text-blue-500" />;
        }
    };

    const getTemperatureColor = (temperature: number) => {
        if (temperature >= 25) return 'text-red-600';
        if (temperature >= 15) return 'text-orange-600';
        return 'text-blue-600';
    };

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                            Weather Data
                        </h1>
                        <p className="text-gray-600 mt-1">Real-time weather information for major cities</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                {loading && weatherData.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-16 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Loading weather data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl shadow-lg border border-red-200 p-12 text-center">
                        <div className="mb-4">
                            <CloudRain className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600 font-semibold text-lg mb-2">{error}</p>
                        </div>
                        <button
                            onClick={fetchWeatherData}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Retry</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                                <h2 className="text-xl font-bold text-gray-900">Weather Data</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                City Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Temperature
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Wind Speed
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {displayData.map((data) => (
                                            <tr
                                                key={data.city}
                                                className="transition-all duration-150 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-3">
                                                        {getWeatherIcon(data.temperature)}
                                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-900">
                                                            {data.city}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-semibold ${getTemperatureColor(data.temperature)}`}>
                                                        {data.temperature !== null && data.temperature !== undefined 
                                                            ? `${data.temperature}°C` 
                                                            : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <Wind className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {data.windSpeed != null ? `${data.windSpeed} km/h` : 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:text-gray-900">
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

                        {lastSync && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Last sync at <span className="font-semibold text-gray-900">{lastSync}</span>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
