import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-8">
          <h2 className="text-xl font-semibold text-gray-800">
            {getPageTitle(window.location.pathname)}
          </h2>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email} ({user?.role})
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const getPageTitle = (path: string): string => {
  switch (path) {
    case '/dashboard':
      return 'Dashboard';
    case '/jobs':
      return 'Job Management';
    case '/materials':
      return 'Materials Inventory';
    case '/spareparts':
      return 'Spare Parts';
    case '/my-jobs':
      return 'My Assigned Jobs';
    default:
      return 'Workshop Manager';
  }
};

export default Layout;