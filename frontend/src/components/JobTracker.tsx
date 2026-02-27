import React, { useEffect, useState } from 'react';
import { getJobs, createJob, updateJob, deleteJob, getEmployees } from '../jobs';
import type { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const JobTracker: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<Partial<Job>>({
    job_title: '',
    assigned_to: null,
    status: 'pending',
    progress: 0,
  });

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'manager') {
      fetchEmployees();
    }
  }, [user]);

  const fetchJobs = async () => {
    const data = await getJobs();
    setJobs(data);
  };

  const fetchEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      await updateJob(editingJob.id, formData);
    } else {
      await createJob(formData);
    }
    setShowForm(false);
    setEditingJob(null);
    setFormData({ job_title: '', assigned_to: null, status: 'pending', progress: 0 });
    fetchJobs();
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData(job);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await deleteJob(id);
      fetchJobs();
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Job Tracker</h1>
        {user?.role === 'manager' && (
          <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            <div className="flex items-center">
              <FaPlus className="mr-2" />
              New Job
            </div>
          </button>
        )}
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingJob ? 'Edit Job' : 'Create Job'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Assign to</label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Progress (%)</label>
                <input
                  type="number"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingJob(null); }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Progress</th>
              <th className="px-4 py-2 text-left">Last Updated</th>
              {user?.role === 'manager' && <th className="px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-t">
                <td className="px-4 py-2">{job.job_title}</td>
                <td className="px-4 py-2">{job.assigned_name || 'Unassigned'}</td>
                <td className="px-4 py-2">
                  {user?.role === 'manager' ? (
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job, e.target.value)}
                      className="border rounded p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded text-sm ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {user?.role === 'manager' ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={job.progress}
                      onChange={(e) => handleProgressChange(job, parseInt(e.target.value))}
                      className="w-16 border rounded p-1"
                    />
                  ) : (
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${job.progress}%` }}></div>
                      </div>
                      <span>{job.progress}%</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{new Date(job.updated_at).toLocaleDateString()}</td>
                {user?.role === 'manager' && (
                  <td className="px-4 py-2">
                    <button onClick={() => handleEdit(job)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobTracker;