import { apiClient } from '@/lib/api-client';

export type ActivityLog = {
  id: number;
  user_id: number | null;
  name: string | null;
  role: string | null;
  action: string;
  description: string;
  target_id: number | null;
  target_type: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getActivityLogs() {
  const result = await apiClient<ActivityLog[]>('/api/activity-log');

  return result.data || [];
}