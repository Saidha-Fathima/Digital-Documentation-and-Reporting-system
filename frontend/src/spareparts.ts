import api from './axiosConfig';
import type { SparePart, MonthlySummary } from './types';

export const getSpareParts = async (): Promise<SparePart[]> => {
  const response = await api.get('/spareparts');
  return response.data;
};

export const addSparePartUsage = async (part: { part_name: string; quantity_used: number }): Promise<{ id: number }> => {
  const response = await api.post('/spareparts', part);
  return response.data;
};

export const deleteSparePart = async (id: number): Promise<void> => {
  await api.delete(`/spareparts/${id}`);
};

export const getMonthlySummary = async (): Promise<MonthlySummary[]> => {
  const response = await api.get('/spareparts/summary/monthly');
  return response.data;
};