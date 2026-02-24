import api from './axiosConfig';
import type { Job } from './types';

export const getJobs = async (): Promise<Job[]> => {
  const response = await api.get('/jobs');
  return response.data;
};

export const createJob = async (job: Partial<Job>): Promise<{ id: number }> => {
  const response = await api.post('/jobs', job);
  return response.data;
};

export const updateJob = async (id: number, updates: Partial<Job>): Promise<void> => {
  await api.put(`/jobs/${id}`, updates);
};

export const deleteJob = async (id: number): Promise<void> => {
  await api.delete(`/jobs/${id}`);
};

export const getEmployees = async (): Promise<{ id: number; name: string }[]> => {
  const response = await api.get('/jobs/employees');
  return response.data;
};