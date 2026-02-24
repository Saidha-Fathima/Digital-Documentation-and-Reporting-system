import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../jobs';
import { getMaterials } from '../materials';
import { getSpareParts } from '../spareparts';
import type { Job, Material, SparePart } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recentParts, setRecentParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, matsData, partsData] = await Promise.all([
          getJobs(),
          getMaterials(),
          getSpareParts()
        ]);
        setJobs(jobsData || []);
        setMaterials(matsData || []);
        setRecentParts((partsData || []).slice(0, 5));
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return <div className="text-center mt-10 text-red-500">Please login first.</div>;
  }

  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === 'pending').length;
  const inProgressJobs = jobs.filter(j => j.status === 'in progress').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;

  const lowStockMaterials = materials.filter(
    m => m.quantity <= m.minimum_level
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your workshop today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon="📋"
          color="bg-blue-500"
          link="/jobs"
        />
        <StatCard
          title="In Progress"
          value={inProgressJobs}
          icon="⚙️"
          color="bg-yellow-500"
          link="/jobs"
        />
        <StatCard
          title="Completed"
          value={completedJobs}
          icon="✅"
          color="bg-green-500"
          link="/jobs"
        />
        <StatCard
          title="Materials"
          value={materials.length}
          icon="📦"
          color="bg-purple-500"
          link="/materials"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockMaterials.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-8 animate-pulse">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Low Stock Alert ({lowStockMaterials.length} items)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockMaterials.map(m => (
                  <div key={m.id} className="bg-white rounded p-3 shadow-sm">
                    <p className="font-medium text-gray-800">{m.material_name}</p>
                    <p className="text-sm text-red-600">
                      Only {m.quantity} left (min {m.minimum_level})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Jobs</h3>
          </div>
          <div className="p-6">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{job.job_title}</p>
                  <p className="text-sm text-gray-500">
                    Assigned to: {job.assigned_name || 'Unassigned'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/jobs" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
              View all jobs →
            </Link>
          </div>
        </div>

        {/* Recent Spare Parts Usage */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Spare Parts Usage</h3>
          </div>
          <div className="p-6">
            {recentParts.map(part => (
              <div key={part.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{part.part_name}</p>
                  <p className="text-sm text-gray-500">
                    Used by: {part.used_by_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Qty: {part.quantity_used}
                  </span>
                </div>
              </div>
            ))}
            <Link to="/spareparts" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
              View all usage →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user.role === 'manager' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              to="/jobs"
              icon="➕"
              title="Create New Job"
              description="Assign tasks to team members"
            />
            <QuickActionButton
              to="/materials"
              icon="📦"
              title="Add Materials"
              description="Update inventory"
            />
            <QuickActionButton
              to="/spareparts"
              icon="🔧"
              title="Record Usage"
              description="Log spare parts consumption"
            />
            <QuickActionButton
              to="/spareparts"
              icon="📊"
              title="View Summary"
              description="Monthly reports"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, link }: any) => (
  <Link to={link} className="block transform hover:scale-105 transition-transform">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`${color} p-4`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </Link>
);

const QuickActionButton = ({ to, icon, title, description }: any) => (
  <Link
    to={to}
    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all group"
  >
    <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{icon}</span>
    <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </Link>
);

export default Dashboard;6