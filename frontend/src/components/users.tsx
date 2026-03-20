import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaShieldAlt,FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// You should define this type in your types.ts file
type User = {
  id: string | number;
  name: string;
  email: string;
  role: 'manager' | 'employee' | 'admin'; // adjust roles as needed
  created_at?: string;
  last_login?: string;
};

const Users: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Replace with your actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Example: const data = await getUsers();
        // For demo purposes only — replace with real fetch
        const mockUsers: User[] = [
          { id: 1, name: 'John Manager', email: 'john@goltens.com', role: 'manager' },
          { id: 2, name: 'Sara Tech',    email: 'sara@goltens.com', role: 'employee' },
          { id: 3, name: 'Mike Worker',  email: 'mike@goltens.com', role: 'employee' },
          { id: 4, name: 'Admin Root',   email: 'admin@goltens.com', role: 'admin' },
        ];
        setUsers(mockUsers);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'manager') {
      fetchUsers();
    }
  }, [user]);

  if (user?.role !== 'manager') {
    return (
      <div className="text-center mt-16 text-xl text-red-600">
        Access restricted to managers only.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FaUsers className="text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600">
            Manage team members, roles and permissions
          </p>
        </div>

        <Link
          to="/users/new" // or use a modal
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md transition-colors"
        >
          <FaUserPlus />
          Add New User
        </Link>
      </div>

      {/* Stats-like overview cards (optional but matches dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={users.length} icon={<FaUsers />} color="bg-blue-500" />
        <StatCard title="Managers" value={users.filter(u => u.role === 'manager').length} icon={<FaShieldAlt />} color="bg-purple-500" />
        <StatCard title="Employees" value={users.filter(u => u.role === 'employee').length} icon={<FaUser />} color="bg-green-500" />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Users</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{u.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'admin'   ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found.
          </div>
        )}
      </div>

      {/* Optional: small hint at bottom */}
      <p className="mt-6 text-sm text-gray-500 text-center">
        User management is available only to managers • Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

/* Reusable StatCard from your Dashboard – just copy-pasted here for completeness */
const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className={`${color} p-4`}>
      <span className="text-3xl text-white">{icon}</span>
    </div>
    <div className="p-4">
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default Users;