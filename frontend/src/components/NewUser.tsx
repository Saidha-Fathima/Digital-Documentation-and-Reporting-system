// src/pages/users/NewUser.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type UserRole = 'admin' | 'manager' | 'employee';

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const NewUser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<NewUserForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Allow manager & admin
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <div className="text-center mt-20 text-xl text-red-600">
        Only managers can create new users.
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.name.trim()) return setError('Name is required');
    if (!form.email.includes('@')) return setError('Valid email is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // safe even if optional
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create user');
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/users');
      }, 1800);

    } catch (err: any) {
      setError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/users"
            className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaUserPlus className="text-blue-600" />
              Add New User
            </h1>
            <p className="text-gray-600 mt-1">Create a new team member account</p>
          </div>
        </div>
      </div>

      {success ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">User created successfully!</h3>
              <p className="mt-2 text-green-700">Redirecting back to user list...</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="name@company.com"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                {user?.role === 'admin' && <option value="admin">Admin</option>}
              </select>
            </div>

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />

            {/* Confirm Password */}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <Link to="/users" className="px-6 py-3 border rounded-lg">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {/* <p className="mt-8 text-center text-sm text-gray-500">
        New users will receive an email with login instructions (once email integration is added)
      </p> */}
    </div>
  );
};

export default NewUser;