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
  const response = await fetch('/api/auth/register/check-npm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ npm }),
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Gagal mengecek data mahasiswa.');
  }

  return result.data as KampusMahasiswa;
}