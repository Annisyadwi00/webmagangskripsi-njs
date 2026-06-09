import { apiClient } from '@/lib/api-client';

export type Mitra = {
  id: number;
  nama_mitra: string;
  logo: string | null;
  alamat: string | null;
  kontak_wa: string | null;
  email: string | null;
  website: string | null;
  deskripsi: string | null;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
  updatedAt: string;
};

export async function getMitraList(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';

  const result = await apiClient<Mitra[] | { data: Mitra[] }>(
    `/api/mitra${query}`
  );

  if (!result.data) return [];

  if (Array.isArray(result.data)) {
    return result.data;
  }

  return result.data.data || [];
}
export async function getAllMitraList() {
  const result = await apiClient<Mitra[] | { data: Mitra[] }>(
    '/api/mitra?all=true'
  );

  if (!result.data) return [];

  if (Array.isArray(result.data)) {
    return result.data;
  }

  return result.data.data || [];
}

export async function createMitra(payload: {
  nama_mitra: string;
  logo?: string | null;
  alamat?: string | null;
  kontak_wa?: string | null;
  email?: string | null;
  website?: string | null;
  deskripsi?: string | null;
}) {
  return apiClient<Mitra>('/api/mitra', {
    method: 'POST',
    body: payload,
  });
}

export async function updateMitra(payload: {
  id: number;
  nama_mitra: string;
  logo?: string | null;
  alamat?: string | null;
  kontak_wa?: string | null;
  email?: string | null;
  website?: string | null;
  deskripsi?: string | null;
  status?: 'Aktif' | 'Nonaktif';
}) {
  return apiClient<null>('/api/mitra', {
    method: 'PUT',
    body: {
      action: 'edit',
      ...payload,
    },
  });
}

export async function activateMitra(id: number) {
  return apiClient<null>('/api/mitra', {
    method: 'PUT',
    body: {
      id,
      action: 'activate',
    },
  });
}

export async function deactivateMitra(id: number) {
  return apiClient<null>('/api/mitra', {
    method: 'PUT',
    body: {
      id,
      action: 'deactivate',
    },
  });
}