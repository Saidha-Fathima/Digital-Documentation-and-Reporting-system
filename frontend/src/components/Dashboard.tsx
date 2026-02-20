import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../jobs';
import { getMaterials } from '../materials';
import type { Job, Material } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, matsData] = await Promise.all([getJobs(), getMaterials()]);
        setJobs(jobsData);
        setMaterials(matsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  const inProgressJobs = jobs.filter(j => j.status === 'in progress').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;

  const lowStockMaterials = materials.filter(m => m.quantity <= m.minimum_level);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Job Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-500 text-sm">Total Jobs</h3>
              <p className="text-2xl font-bold">{totalJobs}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-500 text-sm">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{pendingJobs}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-500 text-sm">In Progress</h3>
              <p className="text-2xl font-bold text-blue-600">{inProgressJobs}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-gray-500 text-sm">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockMaterials.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <h2 className="text-red-800 font-semibold mb-2">⚠️ Low Stock Alert</h2>
              <ul className="list-disc list-inside text-red-700">
                {lowStockMaterials.map(m => (
                  <li key={m.id}>{m.material_name} - {m.quantity} left (min {m.minimum_level})</li>
                ))}
              </ul>
            </div>
          )}

          {/* Manager quick links */}
          {user?.role === 'manager' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <button className="text-primary-600 hover:underline">Create New Job</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;