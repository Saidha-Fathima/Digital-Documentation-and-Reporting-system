export interface User {
  id: number;
  name: string;
  email: string;
  role: 'manager' | 'employee';
}

export interface Job {
  id: number;
  job_title: string;
  assigned_to: number | null;
  assigned_name?: string;
  status: 'pending' | 'in progress' | 'completed';
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: number;
  material_name: string;
  quantity: number;
  minimum_level: number;
}

export interface SparePart {
  id: number;
  part_name: string;
  quantity_used: number;
  used_by: number;
  used_by_name?: string;
  used_date: string;
}

export interface MonthlySummary {
  month: string;
  part_name: string;
  total_used: number;
}