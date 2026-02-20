import React, { useEffect, useState } from 'react';
import { getJobs, updateJob } from '../jobs';
import type { Job } from '../types';
import { useAuth } from '../context/AuthContext';

const EmployeeJobView: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const data = await getJobs();
    setJobs(data);
  };

  const handleStatusChange = async (job: Job, newStatus: string) => {
    await updateJob(job.id, { status: newStatus });
    fetchJobs();
  };

  const handleProgressChange = async (job: Job, newProgress: number) => {
    await updateJob(job.id, { progress: newProgress });
    fetchJobs();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Jobs</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Progress</th>
              <th className="px-4 py-2 text-left">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-t">
                <td className="px-4 py-2">{job.job_title}</td>
                <td className="px-4 py-2">
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={job.progress}
                    onChange={(e) => handleProgressChange(job, parseInt(e.target.value))}
                    className="w-16 border rounded p-1"
                  />
                </td>
                <td className="px-4 py-2">{new Date(job.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeJobView;