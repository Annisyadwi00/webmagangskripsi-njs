import { apiClient } from '@/lib/api-client';

export type PengajuanStatus =
  | 'Menunggu_Verifikasi'
  | 'Pilih_Dosen'
  | 'Aktif'
  | 'Ditolak'
  | 'Selesai';

export type StatusDosen = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type Pengajuan = {
  id: number;
  user_id: number;

  nama_mahasiswa: string;
  npm: string | null;
  program_studi: string | null;
  angkatan: string | null;
  kelas: string | null;

  jenis_magang: string | null;
  no_hp_mahasiswa: string | null;
  foto_diri: string | null;
  bukti_penerimaan: string | null;

  perusahaan: string;
  posisi: string;
  link_loa: string | null;

  alamat_tempat_magang: string | null;
  nama_penanggung_jawab: string | null;
  kontak_penanggung_jawab: string | null;
  latitude: string | null;
  longitude: string | null;
  rencana_magang: string | null;

  tipeKonversi: string | null;
  tgl_mulai: string | null;
  tgl_berakhir: string | null;
  matkulKonversi: string | null;
  semester_konversi: string | null;

  link_laporan_akhir: string | null;

  dosenId: number | null;
  nama_dosen: string | null;
  status_dosen: StatusDosen | null;

  nilai_dari_dosen: string | null;
  nilai_kedisiplinan: number | null;
  nilai_materi: number | null;
  nilai_koding: number | null;
  nilai_laporan: number | null;

  status: PengajuanStatus;
  alasan_penolakan: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export type PengajuanMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PengajuanListResponse = {
  items: Pengajuan[];
  meta: PengajuanMeta;
};

export type CreatePengajuanPayload = {
  nama_mahasiswa?: string;
  npm: string;
  program_studi: string;
  angkatan?: string | null;
  kelas?: string | null;

  jenis_magang: string;
  no_hp_mahasiswa: string;
  foto_diri?: string | null;
  bukti_penerimaan: string;

  perusahaan: string;
  posisi?: string;
  link_loa?: string | null;

  alamat_tempat_magang: string;
  nama_penanggung_jawab: string;
  kontak_penanggung_jawab: string;
  latitude?: string | null;
  longitude?: string | null;

  tgl_mulai: string;
  tgl_berakhir: string;
  rencana_magang: string;
};

export async function getPengajuanList(page = 1, limit = 10) {
  const result = await apiClient<PengajuanListResponse | Pengajuan[]>(
    `/api/pengajuan?page=${page}&limit=${limit}`
  );

  if (!result.data) {
    return {
      items: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }

  if (Array.isArray(result.data)) {
    return {
      items: result.data,
      meta: {
        total: result.data.length,
        page,
        limit,
        totalPages: 1,
      },
    };
  }

  return {
    items: result.data.items || [],
    meta:
      result.data.meta || {
        total: result.data.items?.length || 0,
        page,
        limit,
        totalPages: 1,
      },
  };
}

export async function getPengajuanById(id: number) {
  const result = await getPengajuanList(1, 100);

  const pengajuan = result.items.find((item) => item.id === id);

  if (!pengajuan) {
    throw new Error('Data pengajuan tidak ditemukan.');
  }

  return pengajuan;
}

export async function createPengajuan(payload: CreatePengajuanPayload) {
  return apiClient<Pengajuan>('/api/pengajuan', {
    method: 'POST',
    body: payload,
  });
}

// Deprecated: alur terbaru dosen pembimbing ditentukan oleh admin/koorprodi.
export async function pilihDosen(payload: {
  dosenId: number;
  nama_dosen: string;
}) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'pilih_dosen',
      ...payload,
    },
  });
}

export async function uploadLaporanAkhir(link_laporan_akhir: string) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'upload_laporan_akhir',
      link_laporan_akhir,
    },
  });
}

export async function batalPengajuan() {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'batal',
    },
  });
}

export async function setujuiPengajuan(payload: {
  id: number;
  tipeKonversi?: string;
  matkulKonversi?: unknown;
  semester_konversi?: string;
  dosenId: number;
  nama_dosen: string;
}) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'setujui',
      ...payload,
    },
  });
}

export async function tolakPengajuan(payload: {
  id: number;
  alasan: string;
}) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'tolak',
      ...payload,
    },
  });
}

// Deprecated: dosen tidak lagi menerima/menolak bimbingan.
// Dosen pembimbing ditentukan langsung oleh admin/koorprodi.
export async function terimaBimbingan(id_pengajuan: number) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'terima',
      id_pengajuan,
    },
  });
}

// Deprecated: dosen tidak lagi menerima/menolak bimbingan.
// Dosen pembimbing ditentukan langsung oleh admin/koorprodi.
export async function tolakBimbingan(id_pengajuan: number) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'tolak_bimbingan',
      id_pengajuan,
    },
  });
}

export async function beriNilaiPengajuan(payload: {
  id_pengajuan: number;
  nilai_dari_dosen: string;
  nilai_kedisiplinan: number;
  nilai_materi: number;
  nilai_koding: number;
  nilai_laporan: number;
}) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'beri_nilai',
      ...payload,
    },
  });
}