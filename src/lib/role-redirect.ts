export function getDashboardPathByRole(role?: string) {
  if (role === 'Admin') return '/admin/dashboard';
  if (role === 'Dosen') return '/dosen/dashboard';
  if (role === 'Mahasiswa') return '/dashboard';

  return '/login';
}