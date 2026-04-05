import api from './axiosConfig';
import type { SparePart, SparePartUsage, MonthlySummary } from './types';

export const getSpareParts = async (): Promise<SparePart[]> => {
  const response = await api.get('/spareparts');
  return response.data;
};

export const createSparePart = async (part: Omit<SparePart, 'id'>): Promise<{ id: number }> => {
  const response = await api.post('/spareparts', part);
  return response.data;
};

export const updateSparePart = async (id: number, part: Partial<SparePart>): Promise<void> => {
  await api.put(`/spareparts/${id}`, part);
};

export const deleteSparePart = async (id: number): Promise<void> => {
  await api.delete(`/spareparts/${id}`);
};

export const reportSparePartUsage = async (id: number, quantity_used: number): Promise<SparePartUsage> => {
  const response = await api.post(`/spareparts/${id}/use`, { spare_part_id: id, quantity_used });
  return response.data;
};

export const getSparePartUsages = async (): Promise<SparePartUsage[]> => {
  const response = await api.get('/spareparts/usages');
  return response.data;
};

export const getMonthlySummary = async (): Promise<MonthlySummary[]> => {
  const response = await api.get('/spareparts/summary/monthly');
  return response.data;
};