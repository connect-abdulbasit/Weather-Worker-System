'use client';

import { useState } from 'react';
import { CloudDownload } from 'lucide-react';
import { Job } from './types';
import Button from './components/Button';
import JobsTable from './components/JobsTable';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-001',
      status: 'success',
      timestamp: new Date(Date.now() - 5 * 60000).toLocaleString(),
    },
    {
      id: 'job-002',
      status: 'pending',
      timestamp: new Date(Date.now() - 2 * 60000).toLocaleString(),
    },
    {
      id: 'job-003',
      status: 'success',
      timestamp: new Date(Date.now() - 15 * 60000).toLocaleString(),
    },
    {
      id: 'job-004',
      status: 'failed',
      timestamp: new Date(Date.now() - 30 * 60000).toLocaleString(),
    },
    {
      id: 'job-005',
      status: 'success',
      timestamp: new Date(Date.now() - 45 * 60000).toLocaleString(),
    },
  ]);

  const handleFetchWeather = () => {
    const newJob: Job = {
      id: `job-${String(Date.now()).slice(-6)}`,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
    };
    setJobs([newJob, ...jobs]);
    
    // Simulate status change after 2 seconds
    setTimeout(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === newJob.id ? { ...job, status: 'success' as const } : job
        )
      );
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weather Dashboard</h1>
          <p className="text-gray-600">Monitor and manage weather data fetching jobs</p>
        </div>

        {/* Fetch Weather Button */}
        <div className="mb-8">
          <Button onClick={handleFetchWeather} icon={CloudDownload}>
            Fetch Weather Now
          </Button>
        </div>

        {/* Jobs Table */}
        <JobsTable jobs={jobs} />
      </div>
    </div>
  );
}
