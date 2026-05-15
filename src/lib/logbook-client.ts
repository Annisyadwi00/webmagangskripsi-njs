import { apiClient } from '@/lib/api-client';

export type LogbookStatus = 'Menunggu' | 'Disetujui' | 'Revisi';

export type Logbook = {
  id: number;
  user_id: number;
  pengajuan_id: number;
  tanggal: string;
  kegiatan: string;
  jam_mulai: string;
  jam_selesai: string;
  bukti_kegiatan: string | null;
  status: LogbookStatus;
  komentar_dosen: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getLogbookList() {
  const result = await apiClient<Logbook[]>('/api/logbook');

  if (!result.data) {
    throw new Error('Data logbook tidak ditemukan.');
  }

  return result.data;
}

export async function createLogbook(payload: {
  pengajuan_id: number;
  tanggal: string;
  kegiatan: string;
  jam_mulai: string;
  jam_selesai: string;
  bukti_kegiatan?: string | null;
}) {
  return apiClient<Logbook>('/api/logbook', {
    method: 'POST',
    body: payload,
  });
}

export async function updateLogbook(payload: {
  logbook_id: number;
  kegiatan: string;
  jam_mulai: string;
  jam_selesai: string;
  bukti_kegiatan?: string | null;
}) {
  return apiClient<null>('/api/logbook', {
    method: 'PUT',
    body: {
      action: 'update',
      ...payload,
    },
  });
}

export async function evaluasiLogbook(payload: {
  logbook_id: number;
  status: LogbookStatus;
  komentar_dosen?: string | null;
}) {
  return apiClient<null>('/api/logbook', {
    method: 'PUT',
    body: {
      action: 'evaluasi',
      ...payload,
    },
  });
}