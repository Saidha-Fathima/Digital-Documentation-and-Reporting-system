import api from './axiosConfig';
import type { Material, MaterialUsage } from './types';

export const getMaterials = async (): Promise<Material[]> => {
  const response = await api.get('/materials');
  return response.data;
};

export const createMaterial = async (material: Omit<Material, 'id'>): Promise<{ id: number }> => {
  const response = await api.post('/materials', material);
  return response.data;
};

export const updateMaterial = async (id: number, material: Partial<Material>): Promise<void> => {
  await api.put(`/materials/${id}`, material);
};

export const deleteMaterial = async (id: number): Promise<void> => {
  await api.delete(`/materials/${id}`);
};

export const reportMaterialUsage = async (id: number, quantity_used: number): Promise<MaterialUsage> => {
  const response = await api.post(`/materials/${id}/use`, { material_id: id, quantity_used });
  return response.data;
};