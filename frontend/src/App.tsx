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
import Users from './components/users';           // ← add this import
import NewUser from './components/NewUser';   

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobTracker />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/spareparts" element={<SpareParts />} />
              <Route path="/my-jobs" element={<EmployeeJobView />} />
              
              
              {/* Add user management – only managers should reach here */}
              
              
              {/* Optional: add new user form as separate page or modal later */}
              {/* <Route path="/users/new" element={<UserForm />} /> */}
              {/* <Route path="/users/:id/edit" element={<UserForm />} /> */}
            </Route>
            <Route element={<Layout />}>
  <Route path="/users" element={<Users />} />
  <Route path="/users/new" element={<NewUser />} />
</Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;