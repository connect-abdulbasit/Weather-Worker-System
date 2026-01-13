'use client';

import { useState, useEffect } from 'react';
import { CloudDownload, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
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
    const baseClasses = 'inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'success':
        return (
          <span className={`${baseClasses} bg-green-50 text-green-700`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Success</span>
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700`}>
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700`}>
            <XCircle className="h-3.5 w-3.5" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Weather Dashboard</h1>
          <Link
            href="/weather"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Weather Data →
          </Link>
        </div>

        {/* Fetch Weather Button */}
        <div className="mb-8">
          <button
            onClick={handleFetchWeather}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Enqueueing...</span>
              </>
            ) : (
              <>
                <CloudDownload className="h-5 w-5" />
                <span>Fetch Weather Now</span>
              </>
            )}
          </button>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Job History</h2>
            {fetchingJobs && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      No jobs found. Click &quot;Fetch Weather Now&quot; to start.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{job.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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