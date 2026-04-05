import api from './axiosConfig';

export const getDashboardStats = async () => {
  const response = await api.get('/reports/dashboard-stats');
  return response.data;
};

export const getEmployeePerformance = async () => {
  const response = await api.get('/reports/employee-performance');
  return response.data;
};

export const getUsageTrends = async () => {
  const response = await api.get('/reports/usage-trends');
  return response.data;
};
