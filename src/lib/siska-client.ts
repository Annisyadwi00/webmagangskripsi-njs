import {
  getAngkatanFromNpm,
  getProdiFromNpm,
  isAllowedMahasiswaNpm,
  normalizeNpm,
} from '@/lib/npm-helper';

type SiskaMahasiswa = {
  npm?: string;
  nim?: string;
  npm_mahasiswa?: string;
  nim_mahasiswa?: string;

  nama?: string;
  nama_mahasiswa?: string;
  name?: string;

  email?: string | null;
  email_mahasiswa?: string | null;

  kelas?: string | null;
  nama_kelas?: string | null;
  class?: string | null;
};

export type SiskaMahasiswaResult = {
  npm: string;
  nama: string;
  email: string;
  angkatan: string;
  prodi: string;
  kelas: string;
};

function getMahasiswaObject(result: unknown): SiskaMahasiswa | null {
  if (!result || typeof result !== 'object') return null;

  const data = result as {
    data?: unknown;
    mahasiswa?: unknown;
    result?: unknown;
  };

  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    return data.data as SiskaMahasiswa;
  }

  if (
    data.mahasiswa &&
    typeof data.mahasiswa === 'object' &&
    !Array.isArray(data.mahasiswa)
  ) {
    return data.mahasiswa as SiskaMahasiswa;
  }

  if (
    data.result &&
    typeof data.result === 'object' &&
    !Array.isArray(data.result)
  ) {
    return data.result as SiskaMahasiswa;
  }

  return result as SiskaMahasiswa;
}

function getNpmFromSiska(item: SiskaMahasiswa) {
  return normalizeNpm(
    item.npm ||
      item.nim ||
      item.npm_mahasiswa ||
      item.nim_mahasiswa ||
      ''
  );
}

function getNamaFromSiska(item: SiskaMahasiswa) {
  return String(item.nama || item.nama_mahasiswa || item.name || '').trim();
}

function getEmailFromSiska(item: SiskaMahasiswa, npm: string) {
  const email = String(item.email || item.email_mahasiswa || '').trim();

  if (email) return email;

  return `${npm}@student.unsika.ac.id`;
}

function getKelasFromSiska(item: SiskaMahasiswa) {
  const kelas = String(item.kelas || item.nama_kelas || item.class || '').trim();

  return kelas;
}

function buildSiskaMahasiswaUrl(npm: string) {
  const serverName = process.env.SISKA_SERVER_NAME;
  const path = process.env.SISKA_MAHASISWA_PATH || '/api/mahasiswa/nim';

  if (!serverName) {
    throw new Error('SISKA_SERVER_NAME belum diatur.');
  }

  const baseUrl = serverName.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}/${npm}`;
}

export async function findMahasiswaSiskaByNpm(npmInput: string) {
  const npm = normalizeNpm(npmInput);

  if (!npm) {
    throw new Error('NPM wajib diisi.');
  }

  if (!isAllowedMahasiswaNpm(npm)) {
    throw new Error(
      'NPM tidak valid. Hanya angkatan 2022, 2023, 2024 dengan kode prodi 117 atau 125 yang dapat register.'
    );
  }

  const siskaToken = process.env.SISKA_API_TOKEN;

  if (!siskaToken) {
    throw new Error('SISKA_API_TOKEN belum diatur.');
  }

  const url = buildSiskaMahasiswaUrl(npm);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${siskaToken}`,
    },
    cache: 'no-store',
  });

  if (response.status === 404) {
    throw new Error('NPM tidak ditemukan di data Siska.');
  }

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil data dari API Siska. Status: ${response.status}`
    );
  }

  const result = await response.json();
  const mahasiswa = getMahasiswaObject(result);

  if (!mahasiswa) {
    throw new Error('Data mahasiswa dari Siska tidak ditemukan.');
  }

  const npmFromSiska = getNpmFromSiska(mahasiswa) || npm;

  if (npmFromSiska !== npm) {
    throw new Error('Data NPM dari Siska tidak sesuai dengan NPM yang dicek.');
  }

  const nama = getNamaFromSiska(mahasiswa);

  if (!nama) {
    throw new Error('Data nama mahasiswa dari Siska tidak lengkap.');
  }

  const angkatan = getAngkatanFromNpm(npm);
  const prodi = getProdiFromNpm(npm);

  if (!angkatan || !prodi) {
    throw new Error('Format NPM tidak sesuai ketentuan angkatan/prodi.');
  }

  return {
    npm,
    nama,
    email: getEmailFromSiska(mahasiswa, npm),
    angkatan,
    prodi,
    kelas: getKelasFromSiska(mahasiswa),
  } satisfies SiskaMahasiswaResult;
}