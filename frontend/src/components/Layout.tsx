import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, roles: ['manager', 'employee'] },
    { name: 'Job Tracker', path: '/jobs', icon: ClipboardDocumentListIcon, roles: ['manager', 'employee'] },
    { name: 'Materials', path: '/materials', icon: CubeIcon, roles: ['manager', 'employee'] },
    { name: 'Spare Parts', path: '/spareparts', icon: WrenchScrewdriverIcon, roles: ['manager', 'employee'] },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-primary-700">Goltens</div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            if (item.roles.includes(user?.role!)) {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-2 p-2 mb-2 rounded hover:bg-primary-700 transition"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            }
            return null;
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-800">Welcome, {user?.name}</div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;