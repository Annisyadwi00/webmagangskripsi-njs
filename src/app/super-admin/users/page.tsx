"use client";

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import StatCard from '@/components/ui/StatCard';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  User,
  UserRole,
  createUser,
  deleteUser,
  getUsers,
  resetUserPassword,
} from '@/lib/users-client';

type UserForm = {
  name: string;
  email: string;
  role: Extract<UserRole, 'Admin' | 'Super Admin' | 'Dosen'>;
  nim_nidn: string;
  kategori_dosen: string;
  kuota_bimbingan: string;
  phone: string;
  password: string;
};

const initialForm: UserForm = {
  name: '',
  email: '',
  role: 'Admin',
  nim_nidn: '',
  kategori_dosen: '',
  kuota_bimbingan: '5',
  phone: '',
  password: '',
};

function getRoleBadgeClass(role: UserRole) {
  if (role === 'Super Admin') return 'app-badge app-badge-blue';
  if (role === 'Admin') return 'app-badge app-badge-green';
  if (role === 'Dosen') return 'app-badge app-badge-yellow';

  return 'app-badge app-badge-blue';
}

export default function SuperAdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>(initialForm);
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, userData] = await Promise.all([
        getCurrentUserClient(),
        getUsers(),
      ]);

      if (me.role !== 'Super Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setUsers(userData || []);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data pengguna.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((item) => {
      const name = item.name || '';
      const email = item.email || '';
      const role = item.role || '';
      const nim = item.nim_nidn || '';
      const kategori = item.kategori_dosen || '';

      return (
        name.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        role.toLowerCase().includes(keyword) ||
        nim.toLowerCase().includes(keyword) ||
        kategori.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const totalAdmin = users.filter((item) => item.role === 'Admin').length;
  const totalSuperAdmin = users.filter(
    (item) => item.role === 'Super Admin'
  ).length;
  const totalDosen = users.filter((item) => item.role === 'Dosen').length;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.role) {
      return 'Nama, email, dan role wajib diisi.';
    }

    if (form.password && form.password.length < 8) {
      return 'Password minimal 8 karakter.';
    }

    if (form.phone && !/^62\d{8,15}$/.test(form.phone)) {
      return 'Nomor WhatsApp harus diawali 62. Contoh: 6285456123.';
    }

    if (form.role === 'Dosen' && !form.nim_nidn.trim()) {
      return 'NIDN wajib diisi untuk akun dosen.';
    }

    if (Number(form.kuota_bimbingan) < 0) {
      return 'Kuota bimbingan tidak boleh kurang dari 0.';
    }

    return '';
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setErrorMsg('');
    setDefaultPassword('');

    const validation = validateForm();

    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || null,
        role: form.role,
        nim_nidn: form.nim_nidn.trim() || '-',
        prodi: null,
        semester: null,
        angkatan: null,
        kelas: null,
        kategori_dosen:
          form.role === 'Dosen' ? form.kategori_dosen.trim() || null : null,
        kuota_bimbingan:
          form.role === 'Dosen' ? Number(form.kuota_bimbingan || 5) : null,
        phone: form.phone.trim() || null,
      });

      setMessage(result.message || 'User berhasil ditambahkan.');

      if (result.data?.defaultPassword) {
        setDefaultPassword(result.data.defaultPassword);
      }

      setForm(initialForm);
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal menambahkan user.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (user: User) => {
    const confirmed = window.confirm(
      `Reset password untuk ${user.name}? Password baru akan ditampilkan setelah proses berhasil.`
    );

    if (!confirmed) return;

    setMessage('');
    setErrorMsg('');
    setDefaultPassword('');

    try {
      const result = await resetUserPassword(user.id);

      setMessage(result.message || 'Password berhasil direset.');

      if (result.data?.defaultPassword) {
        setDefaultPassword(result.data.defaultPassword);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal reset password.';

      setErrorMsg(msg);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (currentUser?.id === user.id) {
      setErrorMsg('Akun yang sedang digunakan tidak dapat dihapus.');
      return;
    }

    const confirmed = window.confirm(
      `Hapus akun ${user.name}? Aksi ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setMessage('');
    setErrorMsg('');

    try {
      const result = await deleteUser(user.id);

      setMessage(result.message || 'User berhasil dihapus.');
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal menghapus user.';

      setErrorMsg(msg);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell role="Super Admin">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="User Management"
            description="Kelola akun Admin, Super Admin, dan Dosen. Akun mahasiswa tidak dibuat manual di halaman ini."
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {defaultPassword && (
            <Alert variant="info">
              Password default: <strong>{defaultPassword}</strong>. Simpan atau
              kirimkan password ini kepada pengguna terkait.
            </Alert>
          )}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Admin"
              value={totalAdmin}
              description="Akun staff pengelola sistem."
              icon="users"
            />

            <StatCard
              title="Super Admin"
              value={totalSuperAdmin}
              description="Akun pengelola utama sistem."
              icon="check"
            />

            <StatCard
              title="Dosen"
              value={totalDosen}
              description="Akun dosen untuk pembimbing/penguji."
              icon="briefcase"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Tambah User
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tambahkan akun Admin, Super Admin, atau Dosen.
              </p>

              <form onSubmit={handleCreateUser} className="mt-6 space-y-5">
                <div>
                  <label className="app-label">Nama</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="Nama user"
                  />
                </div>

                <div>
                  <label className="app-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="email@unsika.ac.id"
                  />
                </div>

                <div>
                  <label className="app-label">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="app-input"
                  >
                    <option value="Admin">Admin / Staff TU</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Dosen">Dosen</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">
                    {form.role === 'Dosen' ? 'NIDN' : 'NIP/NIDN'}
                  </label>
                  <input
                    type="text"
                    name="nim_nidn"
                    value={form.nim_nidn}
                    onChange={handleChange}
                    className="app-input"
                    placeholder={form.role === 'Dosen' ? 'NIDN dosen' : '-'}
                  />
                </div>

                {form.role === 'Dosen' && (
                  <>
                    <div>
                      <label className="app-label">Kategori Dosen</label>
                      <input
                        type="text"
                        name="kategori_dosen"
                        value={form.kategori_dosen}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Contoh: Pembimbing Magang"
                      />
                    </div>

                    <div>
                      <label className="app-label">Kuota Bimbingan</label>
                      <input
                        type="number"
                        min={0}
                        name="kuota_bimbingan"
                        value={form.kuota_bimbingan}
                        onChange={handleChange}
                        className="app-input"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="app-label">Nomor WhatsApp</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: e.target.value.replace(/[^0-9]/g, ''),
                      }))
                    }
                    className="app-input"
                    placeholder="628xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="app-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="Kosongkan untuk password default"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Jika dikosongkan, sistem akan membuat password default.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambah User'}
                </button>
              </form>
            </div>

            <div className="app-card p-6 lg:col-span-2">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Daftar Pengguna
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Menampilkan akun Admin, Super Admin, dan Dosen.
                  </p>
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input md:max-w-xs"
                  placeholder="Cari nama/email/role/NIDN..."
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Data user tidak ditemukan.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-black">Nama</th>
                        <th className="px-5 py-4 font-black">Email</th>
                        <th className="px-5 py-4 font-black">Role</th>
                        <th className="px-5 py-4 font-black">NIP/NIDN</th>
                        <th className="px-5 py-4 font-black">Kuota</th>
                        <th className="px-5 py-4 font-black">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map((item) => (
                        <tr key={item.id} className="align-top">
                          <td className="px-5 py-4">
                            <p className="font-black text-slate-950 dark:text-white">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {item.phone || '-'}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {item.email}
                          </td>

                          <td className="px-5 py-4">
                            <span className={getRoleBadgeClass(item.role)}>
                              {item.role}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {item.nim_nidn || '-'}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {item.role === 'Dosen'
                              ? item.kuota_bimbingan ?? 5
                              : '-'}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => handleResetPassword(item)}
                                className="app-btn-secondary px-3 py-2 text-xs"
                              >
                                Reset Password
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(item)}
                                disabled={currentUser?.id === item.id}
                                className="app-btn-danger px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}