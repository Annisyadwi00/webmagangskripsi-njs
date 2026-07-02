import { apiClient } from '@/lib/api-client';

export type PengajuanLowonganStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type SistemKerjaLowongan = 'Onsite' | 'Hybrid' | 'Remote';

export type TipeKonversiLowongan =
  | 'Konversi 20 SKS'
  | 'Tidak Konversi'
  | 'Konversi 2 SKS';

export type PengajuanLowongan = {
  id: number;

  nama_mitra: string;
  alamat_mitra: string | null;
  website_mitra: string | null;

  nama_pic: string;
  kontak_pic: string;
  email_pic: string | null;

  posisi: string;
  deskripsi: string;
  persyaratan: string | null;
  lokasi: string | null;
  sistem_kerja: SistemKerjaLowongan;
  tipe_konversi: TipeKonversiLowongan;
  kuota: number;
  link_pendaftaran: string | null;
  valid_until?: string | null;

  status: PengajuanLowonganStatus;
  catatan_super_admin: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreatePengajuanLowonganPayload = {
  nama_mitra: string;
  alamat_mitra?: string | null;
  website_mitra?: string | null;

  nama_pic: string;
  kontak_pic: string;
  email_pic?: string | null;

  posisi: string;
  deskripsi: string;
  persyaratan?: string | null;
  lokasi?: string | null;
  sistem_kerja: SistemKerjaLowongan;
  tipe_konversi: TipeKonversiLowongan;
  kuota: number;
  link_pendaftaran?: string | null;
  valid_until?: string | null;
};

export async function getPengajuanLowonganList() {
  const result = await apiClient<PengajuanLowongan[]>(
    '/api/pengajuan-lowongan'
  );

  return result.data || [];
}

export async function createPengajuanLowongan(
  payload: CreatePengajuanLowonganPayload
) {
  return apiClient<PengajuanLowongan>('/api/pengajuan-lowongan', {
    method: 'POST',
    body: payload,
  });
}

export async function updateStatusPengajuanLowongan(payload: {
  id: number;
  status: PengajuanLowonganStatus;
  catatan_super_admin?: string | null;
}) {
  return apiClient<null>('/api/pengajuan-lowongan', {
    method: 'PUT',
    body: payload,
  });
}