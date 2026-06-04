import { apiClient } from '@/lib/api-client';

export type UserRole = 'Admin' | 'Super Admin' | 'Mahasiswa' | 'Dosen';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  nim_nidn: string;
  prodi: string | null;
  semester: string | null;
  kategori_dosen: string | null;
  kuota_bimbingan: number;
  phone?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getUsers() {
  const result = await apiClient<User[]>('/api/users');

  if (!result.data) {
    throw new Error('Data pengguna tidak ditemukan.');
  }

  return result.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password?: string | null;
  role: UserRole;
  nim_nidn?: string;
  prodi?: string | null;
  semester?: string | null;
  kategori_dosen?: string | null;
}) {
  return apiClient<{
    defaultPassword: string | null;
  }>('/api/users', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteUser(id: number) {
  return apiClient<null>('/api/users', {
    method: 'PUT',
    body: {
      id,
      action: 'delete',
    },
  });
}

export async function resetUserPassword(id: number) {
  return apiClient<{
    defaultPassword: string;
  }>('/api/users', {
    method: 'PUT',
    body: {
      id,
      action: 'reset_password',
    },
  });
}