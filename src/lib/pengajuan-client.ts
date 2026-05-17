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
  perusahaan: string;
  posisi: string;
  link_loa: string | null;
  tipeKonversi: string | null;
  tgl_mulai: string | null;
  tgl_berakhir: string | null;
  matkulKonversi: string | null;
  link_laporan_akhir: string | null;
  nilai_dari_dosen: string | null;
  dosenId: number | null;
  nama_dosen: string | null;
  nilai_kedisiplinan: number | null;
  nilai_materi: number | null;
  nilai_koding: number | null;
  nilai_laporan: number | null;
  status: PengajuanStatus;
  status_dosen: StatusDosen | null;
  semester_konversi: string | null;
  alasan_penolakan: string | null;
  createdAt: string;
  updatedAt: string;
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
export async function createPengajuan(payload: {
  perusahaan: string;
  posisi: string;
  link_loa: string;
  nama_mahasiswa?: string;
  tgl_mulai: string;
  tgl_berakhir: string;
}) {
  const result = await apiClient<Pengajuan>('/api/pengajuan', {
    method: 'POST',
    body: payload,
  });

  return result;
}

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

export async function terimaBimbingan(id_pengajuan: number) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'terima',
      id_pengajuan,
    },
  });
}

export async function tolakBimbingan(id_pengajuan: number) {
  return apiClient<null>('/api/pengajuan', {
    method: 'PUT',
    body: {
      action: 'tolak',
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