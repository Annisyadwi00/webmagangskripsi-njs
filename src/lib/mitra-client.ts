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