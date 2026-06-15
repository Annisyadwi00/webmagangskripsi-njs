// src/lib/kampus-client.ts

export type KampusMahasiswa = {
  npm: string;
  nama: string;
  email: string;
  prodi: string;
  angkatan: string;
  semester: string;
  kelas: string;
  no_hp: string;
};

class KampusApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status = 500, data?: unknown) {
    super(message);
    this.name = 'KampusApiError';
    this.status = status;
    this.data = data;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const val = data[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
    if (typeof val === 'number') return String(val);
  }
  return '';
}

function normalizeMahasiswa(raw: Record<string, unknown>): KampusMahasiswa {
  return {
    npm: getString(raw, ['npm', 'nim', 'NPM', 'NIM']),
    nama: getString(raw, ['nama', 'name', 'nama_mahasiswa', 'Nama']),
    email: getString(raw, ['email', 'email_kampus', 'Email']),
    prodi: getString(raw, ['prodi', 'program_studi', 'jurusan', 'Program Studi']),
    angkatan: getString(raw, ['angkatan', 'tahun_masuk', 'Angkatan']),
    semester: getString(raw, ['semester', 'Semester']),
    kelas: getString(raw, ['kelas', 'Kelas']),
    no_hp: getString(raw, ['no_hp', 'phone', 'nomor_hp', 'wa', 'whatsapp']),
  };
}

export async function getMahasiswaKampusByNpm(npm: string): Promise<KampusMahasiswa> {
  // Panggil API route internal Next.js (server-side)
  const response = await fetch(`/api/kampus/mahasiswa/${encodeURIComponent(npm)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new KampusApiError(
      'Gagal mengambil data mahasiswa dari API kampus.',
      response.status,
      result
    );
  }

  // Ekstrak data dari response API SISKA (sudah diforward oleh route.ts)
  let rawData: Record<string, unknown> | null = null;
  if (Array.isArray(result)) {
    rawData = isRecord(result[0]) ? result[0] : null;
  } else if (isRecord(result)) {
    const data = result.data;
    if (Array.isArray(data) && isRecord(data[0])) rawData = data[0];
    else if (isRecord(data)) rawData = data;
    else rawData = result;
  }

  if (!rawData) {
    throw new KampusApiError('Data mahasiswa tidak ditemukan.', 404);
  }

  const mahasiswa = normalizeMahasiswa(rawData);
  if (!mahasiswa.npm && !mahasiswa.nama) {
    throw new KampusApiError(
      'Data mahasiswa diterima tetapi format response tidak sesuai mapping.',
      422,
      result
    );
  }
  return mahasiswa;
}