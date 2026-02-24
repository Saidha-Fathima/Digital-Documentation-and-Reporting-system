import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Jobs', path: '/jobs', icon: '📋' },
    { name: 'Materials', path: '/materials', icon: '📦' },
    { name: 'Spare Parts', path: '/spareparts', icon: '🔧' },
    ...(user?.role === 'employee' ? [{ name: 'My Jobs', path: '/my-jobs', icon: '👤' }] : []),
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Workshop Manager</h1>
        <p className="text-sm text-gray-400 mt-2 capitalize">{user?.role}</p>
      </div>

      <nav className="flex-1 px-4">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <span className="mr-3 text-xl">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;