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
  email_pic: string | null;

  lokasi: string | null;
  sistem_kerja: string | null;
  kuota: number | null;
  link_pendaftaran: string | null;
  deskripsi_lowongan: string | null;
  persyaratan: string | null;

  link_akta_pendirian: string | null;
  link_akta_direksi: string | null;
  link_ktp_penandatangan: string | null;
  link_npwp: string | null;
  link_izin_usaha: string | null;
  link_logo: string | null;

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
  email_pic: string;

  nama_mahasiswa_pengusul?: string;
  npm_mahasiswa_pengusul: string;
  program_studi_mahasiswa: string;
  angkatan_mahasiswa: string;
  kontak_mahasiswa: string;
  kelas: string;

  lokasi: string;
  sistem_kerja: 'Onsite' | 'Hybrid' | 'Remote';
  kuota: number;
  link_pendaftaran?: string | null;
  deskripsi_lowongan: string;
  persyaratan: string;

  link_akta_pendirian?: string | null;
  link_akta_direksi?: string | null;
  link_ktp_penandatangan?: string | null;
  link_npwp?: string | null;
  link_izin_usaha?: string | null;
};

function normalizePengajuanMitraData(
  data?: PengajuanMitra[] | { data?: PengajuanMitra[] } | null
) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  return data.data || [];
}

export async function getPengajuanMitraList() {
  const result = await apiClient<
    PengajuanMitra[] | { data?: PengajuanMitra[] }
  >('/api/pengajuan-mitra');

  return normalizePengajuanMitraData(result.data);
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