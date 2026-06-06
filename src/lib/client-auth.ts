import { apiClient } from '@/lib/api-client';

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Super Admin' | 'Mahasiswa' | 'Dosen';
  nim_nidn: string;
  prodi?: string | null;
  semester?: string | null;
  kategori_dosen?: string | null;
  kuota_bimbingan?: number;
  phone?: string | null;
  photo?: string | null;
};

export async function getCurrentUserClient() {
  const result = await apiClient<CurrentUser>('/api/auth/me');

  if (!result.data) {
    throw new Error('Data user tidak ditemukan.');
  }

  return result.data;
}