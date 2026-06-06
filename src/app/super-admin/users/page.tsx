"use client";

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
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
  role: Extract<UserRole, 'Admin' | 'Super Admin'>;
  password: string;
};

const initialForm: UserForm = {
  name: '',
  email: '',
  role: 'Admin',
  password: '',
};

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
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.role.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setErrorMsg('');
    setDefaultPassword('');

    if (!form.name.trim() || !form.email.trim() || !form.role) {
      setErrorMsg('Nama, email, dan role wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || null,
        role: form.role,
        nim_nidn: '-',
        prodi: null,
        semester: null,
        kategori_dosen: null,
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
            description="Kelola akun Admin dan staff. Akun mahasiswa dan dosen tidak ditampilkan pada halaman ini."
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {defaultPassword && (
            <Alert variant="info">
              Password default: <strong>{defaultPassword}</strong>. Simpan atau
              kirimkan password ini kepada pengguna terkait.
            </Alert>
          )}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Tambah User
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tambahkan akun Admin atau staff.
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
                    <option value="Super Admin">staff</option>
                  </select>
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
                    Daftar Admin
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Menampilkan akun Admin dan Super Admin.
                  </p>
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input md:max-w-xs"
                  placeholder="Cari nama/email/role..."
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
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-black">Nama</th>
                        <th className="px-5 py-4 font-black">Email</th>
                        <th className="px-5 py-4 font-black">Role</th>
                        <th className="px-5 py-4 font-black">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map((item) => (
                        <tr key={item.id} className="align-top">
                          <td className="px-5 py-4 font-black text-slate-950 dark:text-white">
                            {item.name}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {item.email}
                          </td>

                          <td className="px-5 py-4">
                            <span className="app-badge app-badge-blue">
                              {item.role}
                            </span>
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