export const ALLOWED_ANGKATAN = ['2022', '2023', '2024'] as const;

export const PRODI_BY_KODE_NPM: Record<string, string> = {
  '117': 'Teknik Informatika',
  '125': 'Sistem Informasi',
};

export function normalizeNpm(npm: string) {
  return String(npm || '').replace(/\D/g, '').trim();
}

export function getAngkatanFromNpm(npm: string) {
  const normalized = normalizeNpm(npm);
  const prefixAngkatan = normalized.slice(0, 2);
  const angkatan = `20${prefixAngkatan}`;

  if (!ALLOWED_ANGKATAN.includes(angkatan as typeof ALLOWED_ANGKATAN[number])) {
    return null;
  }

  return angkatan;
}

export function getKodeProdiFromNpm(npm: string) {
  const normalized = normalizeNpm(npm);

  // Contoh: 2210631170112
  // index 0-1 = 22
  // index 6-8 = 117
  return normalized.slice(6, 9);
}

export function getProdiFromNpm(npm: string) {
  const kodeProdi = getKodeProdiFromNpm(npm);

  return PRODI_BY_KODE_NPM[kodeProdi] || null;
}

export function isAllowedMahasiswaNpm(npm: string) {
  const angkatan = getAngkatanFromNpm(npm);
  const prodi = getProdiFromNpm(npm);

  return Boolean(angkatan && prodi);
}