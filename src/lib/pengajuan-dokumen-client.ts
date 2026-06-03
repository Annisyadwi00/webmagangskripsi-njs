import { apiClient } from '@/lib/api-client';

export type PengajuanDokumenStatus =
  | 'Menunggu'
  | 'Diproses'
  | 'Selesai'
  | 'Ditolak';

export type JenisDokumen =
  | 'Surat Permohonan Magang'
  | 'SK Dosen Pembimbing'
  | 'Surat Perpanjangan Magang'
  | 'Surat Keterangan Selesai Magang'
  | 'Implementation of Arrangement'
  | 'Laporan Pelaksanaan Kerja Sama'
  | 'Dokumen Nilai Akhir'
  | 'Lainnya';

export type PengajuanDokumen = {
  id: number;
  user_id: number;

  nama_mahasiswa: string;
  npm: string;
  program_studi: string;
  kelas: string;

  jenis_dokumen: JenisDokumen;
  keperluan: string;
  catatan_mahasiswa: string | null;

  status: PengajuanDokumenStatus;
  catatan_admin: string | null;
  link_dokumen: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreatePengajuanDokumenPayload = {
  nama_mahasiswa?: string;
  npm: string;
  program_studi: string;
  kelas: string;

  jenis_dokumen: JenisDokumen;
  keperluan: string;
  catatan_mahasiswa?: string | null;
};

export async function getPengajuanDokumenList() {
  const result = await apiClient<
    PengajuanDokumen[] | { data: PengajuanDokumen[] }
  >('/api/pengajuan-dokumen');

  if (!result.data) return [];

  if (Array.isArray(result.data)) {
    return result.data;
  }

  return result.data.data || [];
}

export async function createPengajuanDokumen(
  payload: CreatePengajuanDokumenPayload
) {
  return apiClient<PengajuanDokumen>('/api/pengajuan-dokumen', {
    method: 'POST',
    body: payload,
  });
}

export async function updateStatusPengajuanDokumen(payload: {
  id: number;
  status: PengajuanDokumenStatus;
  catatan_admin?: string | null;
  link_dokumen?: string | null;
}) {
  return apiClient<null>('/api/pengajuan-dokumen', {
    method: 'PUT',
    body: payload,
  });
}