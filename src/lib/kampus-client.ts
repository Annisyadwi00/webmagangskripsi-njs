export type KampusMahasiswa = {
  npm: string;
  nama: string;
  prodi?: string | null;
  angkatan?: string | null;
  semester?: string | null;
  kelas?: string | null;
  no_hp?: string | null;
  email?: string | null;
};

export async function getMahasiswaKampusByNpm(npm: string) {
  const response = await fetch(`/api/kampus/mahasiswa?npm=${npm}`, {
    method: 'GET',
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Gagal mengambil data mahasiswa kampus.');
  }

  return result.data as KampusMahasiswa;
}