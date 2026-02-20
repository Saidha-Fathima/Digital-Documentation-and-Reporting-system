import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JobTracker from './components/JobTracker';
import Materials from './components/Materials';
import SpareParts from './components/SpareParts';
import EmployeeJobView from './components/EmployeeJobView';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobTracker />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/spareparts" element={<SpareParts />} />
              {/* For employees, we could also keep the same jobs route; but we can add a separate one */}
              <Route path="/my-jobs" element={<EmployeeJobView />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;