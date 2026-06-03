import { apiClient } from '@/lib/api-client';

export type PengajuanMitraStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type PengajuanMitra = {
  id: number;
  user_id: number;

  nama_mitra: string;
  alamat_kantor_mitra: string;
  url_mitra: string | null;
  nama_narahubung_mitra: string;
  kontak_narahubung_mitra: string;

  nama_mahasiswa_pengusul: string;
  npm_mahasiswa_pengusul: string;
  program_studi_mahasiswa: string;
  angkatan_mahasiswa: string;
  kontak_mahasiswa: string;
  kelas: string;

  status: PengajuanMitraStatus;
  catatan_admin: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreatePengajuanMitraPayload = {
  nama_mitra: string;
  alamat_kantor_mitra: string;
  url_mitra?: string | null;
  nama_narahubung_mitra: string;
  kontak_narahubung_mitra: string;

  nama_mahasiswa_pengusul?: string;
  npm_mahasiswa_pengusul: string;
  program_studi_mahasiswa: string;
  angkatan_mahasiswa: string;
  kontak_mahasiswa: string;
  kelas: string;
};

export async function getPengajuanMitraList() {
  const result = await apiClient<
    PengajuanMitra[] | { data: PengajuanMitra[] }
  >('/api/pengajuan-mitra');

  if (!result.data) return [];

  if (Array.isArray(result.data)) {
    return result.data;
  }

  return result.data.data || [];
}

export async function createPengajuanMitra(
  payload: CreatePengajuanMitraPayload
) {
  return apiClient<PengajuanMitra>('/api/pengajuan-mitra', {
    method: 'POST',
    body: payload,
  });
}

export async function updateStatusPengajuanMitra(payload: {
  id: number;
  status: PengajuanMitraStatus;
  catatan_admin?: string | null;
}) {
  return apiClient<null>('/api/pengajuan-mitra', {
    method: 'PUT',
    body: payload,
  });
}