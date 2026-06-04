import { apiClient } from '@/lib/api-client';

export type JobType = 'Onsite' | 'Hybrid' | 'Remote';
export type JobTipeKonversi =
  | 'Konversi 20 SKS'
  | 'Tidak Konversi'
  | 'Konversi 2 SKS';
export type JobStatus = 'Aktif' | 'Nonaktif';

export type Lowongan = {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  type: JobType;
  tipeKonversi: JobTipeKonversi;
  kategori: string;
  isPaid: boolean;
  valid_until: string | null;
  kuota: number;
  link_pendaftaran: string | null;
  email_perusahaan: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

export async function getLowonganList() {
  const result = await apiClient<Lowongan[]>('/api/lowongan');

  if (!result.data) {
    throw new Error('Data lowongan tidak ditemukan.');
  }

  return result.data;
}

export async function createLowongan(payload: {
  posisi: string;
  perusahaan: string;
  deskripsi: string;
  location?: string;
  kategori?: string;
  type: JobType;
  tipeKonversi: JobTipeKonversi;
  isPaid: boolean | 'Ya' | 'Tidak';
  kuota: number;
  link_pendaftaran?: string | null;
  email_perusahaan?: string | null;
  valid_until?: string | null;
}) {
  return apiClient<Lowongan>('/api/lowongan', {
    method: 'POST',
    body: payload,
  });
}

export async function updateLowongan(payload: {
  id: number;
  posisi: string;
  perusahaan: string;
  deskripsi: string;
  location?: string;
  kategori?: string;
  type: JobType;
  tipeKonversi: JobTipeKonversi;
  isPaid: boolean | 'Ya' | 'Tidak';
  kuota: number;
  link_pendaftaran?: string | null;
  email_perusahaan?: string | null;
  valid_until?: string | null;
  status?: JobStatus;
}) {
  return apiClient<null>('/api/lowongan', {
    method: 'PUT',
    body: {
      action: 'edit',
      ...payload,
    },
  });
}

export async function activateLowongan(id: number) {
  return apiClient<null>('/api/lowongan', {
    method: 'PUT',
    body: {
      id,
      action: 'activate',
    },
  });
}

export async function deactivateLowongan(id: number) {
  return apiClient<null>('/api/lowongan', {
    method: 'PUT',
    body: {
      id,
      action: 'deactivate',
    },
  });
}

export async function deleteLowongan(id: number) {
  return apiClient<null>('/api/lowongan', {
    method: 'PUT',
    body: {
      id,
      action: 'delete',
    },
  });
}
export async function getAllLowonganList() {
  const result = await apiClient<Lowongan[]>('/api/lowongan?all=true');

  if (!result.data) {
    throw new Error('Data lowongan tidak ditemukan.');
  }

  return result.data;
}