'use client';

import { useState, useEffect, useMemo } from 'react';
import { CloudDownload, CheckCircle2, Clock, XCircle, Loader2, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type JobStatus = 'success' | 'pending' | 'failed';

interface Job {
  id: string;
  status: JobStatus;
  timestamp: string;
}

interface JobResponse {
  id: string;
  status: string;
  timestamp: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const total = jobs.length;
    const success = jobs.filter(j => j.status === 'success').length;
    const pending = jobs.filter(j => j.status === 'pending').length;
    const failed = jobs.filter(j => j.status === 'failed').length;
    return { total, success, pending, failed };
  }, [jobs]);
  
  // Fetch jobs on component mount and periodically
  const fetchJobs = async () => {
    try {
      setFetchingJobs(true);
      const response = await fetch('/api/job');
      const data = await response.json();
      
      if (data.success && data.jobs) {
        setJobs((data.jobs as JobResponse[]).map((job) => ({
          id: job.id,
          status: job.status as JobStatus,
          timestamp: new Date(job.timestamp).toLocaleString(),
        })));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setFetchingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Poll for job updates every 3 seconds
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const handleFetchWeather = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh jobs list
        await fetchJobs();
      } else {
        console.error('Failed to enqueue job:', data.error);
        alert('Failed to enqueue job. Please try again.');
      }
    } catch (error) {
      console.error('Error enqueueing job:', error);
      alert('Error enqueueing job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const baseClasses = 'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm';
    switch (status) {
      case 'success':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Success</span>
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200`}>
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200`}>
            <XCircle className="h-3.5 w-3.5" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Navigation */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Weather Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage weather data fetching jobs</p>
          </div>
          <Link
            href="/weather"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
          >
            <Activity className="h-4 w-4" />
            <span>View Weather Data</span>
            <span>→</span>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.success}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Fetch Weather Button */}
        <div className="mb-8">
          <button
            onClick={handleFetchWeather}
            disabled={loading}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Enqueueing Job...</span>
              </>
            ) : (
              <>
                <CloudDownload className="h-5 w-5 group-hover:animate-bounce" />
                <span>Fetch Weather Now</span>
              </>
            )}
          </button>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Job History</h2>
            {fetchingJobs && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CloudDownload className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No jobs found</p>
                        <p className="text-sm text-gray-400 mt-1">Click &quot;Fetch Weather Now&quot; to start</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-medium text-gray-900 group-hover:text-blue-900">
                          {job.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:text-gray-900">
                        {job.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}