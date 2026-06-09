import { apiClient } from '@/lib/api-client';

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Super Admin' | 'Mahasiswa' | 'Dosen';
  nim_nidn: string;

  prodi?: string | null;
  semester?: string | null;
  angkatan?: string | null;
  kelas?: string | null;

  kategori_dosen?: string | null;
  kuota_bimbingan?: number | null;

  phone?: string | null;
  photo?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export async function getCurrentUserClient() {
  const result = await apiClient<CurrentUser>('/api/auth/me');

  if (!result.data) {
    throw new Error('Data user tidak ditemukan.');
  }

  return result.data;
}