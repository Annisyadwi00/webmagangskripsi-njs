import { apiClient } from '@/lib/api-client';

export type MitraStatus = 'Aktif' | 'Nonaktif';

export type Mitra = {
  id: number;
  nama_mitra: string;
  logo: string | null;
  alamat: string | null;
  kontak_wa: string | null;
  email: string | null;
  website: string | null;
  deskripsi: string | null;
  status: MitraStatus;
  createdAt: string;
  updatedAt: string;
};

function normalizeMitraData(data?: Mitra[] | { data?: Mitra[] } | null) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  return data.data || [];
}

export async function getMitraList(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';

  const result = await apiClient<Mitra[] | { data?: Mitra[] }>(
    `/api/mitra${query}`
  );

  return normalizeMitraData(result.data);
}

export async function getAllMitraList() {
  const result = await apiClient<Mitra[] | { data?: Mitra[] }>(
    '/api/mitra?all=true'
  );

  return normalizeMitraData(result.data);
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
  status?: MitraStatus;
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