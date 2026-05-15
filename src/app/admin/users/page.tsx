"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  User,
  UserRole,
  getUsers,
  createUser,
  deleteUser,
  resetUserPassword,
} from '@/lib/users-client';

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nim_nidn: string;
  prodi: string;
  semester: string;
  kategori_dosen: string;
};

const initialForm: UserForm = {
  name: '',
  email: '',
  password: '',
  role: 'Mahasiswa',
  nim_nidn: '',
  prodi: 'S1 Informatika',
  semester: '',
  kategori_dosen: '',
};

function getRoleBadgeClass(role: UserRole) {
  if (role === 'Admin') {
    return 'app-badge app-badge-red';
  }

  if (role === 'Dosen') {
    return 'app-badge app-badge-blue';
  }

  return 'app-badge app-badge-green';
}

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>(initialForm);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'Semua'>('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, usersData] = await Promise.all([
        getCurrentUserClient(),
        getUsers(),
      ]);

      if (me.role !== 'Admin') {
        window.location.href = '/login';
        return;
      }

      setCurrentUser(me);
      setUsers(usersData);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengguna.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');
    setDefaultPassword('');

    try {
      const result = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || null,
        role: form.role,
        nim_nidn: form.nim_nidn.trim() || '-',
        prodi: form.role === 'Mahasiswa' ? form.prodi : null,
        semester: form.role === 'Mahasiswa' ? form.semester || null : null,
        kategori_dosen:
          form.role === 'Dosen' ? form.kategori_dosen || null : null,
      });

      setMessage(result.message || 'Pengguna berhasil ditambahkan.');

      if (result.data?.defaultPassword) {
        setDefaultPassword(result.data.defaultPassword);
      }

      resetForm();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menambahkan pengguna.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (id: number) => {
    const confirmed = confirm('Yakin ingin reset password pengguna ini?');

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');
    setDefaultPassword('');

    try {
      const result = await resetUserPassword(id);

      setMessage(result.message || 'Password berhasil direset.');

      if (result.data?.defaultPassword) {
        setDefaultPassword(result.data.defaultPassword);
      }

      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal reset password.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm('Yakin ingin menghapus pengguna ini?');

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');
    setDefaultPassword('');

    try {
      const result = await deleteUser(id);
      setMessage(result.message || 'Pengguna berhasil dihapus.');
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menghapus pengguna.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.nim_nidn?.toLowerCase().includes(keyword);

      const matchesRole = roleFilter === 'Semua' || user.role === roleFilter;

      return matchesKeyword && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalMahasiswa = users.filter((user) => user.role === 'Mahasiswa').length;
  const totalDosen = users.filter((user) => user.role === 'Dosen').length;
  const totalAdmin = users.filter((user) => user.role === 'Admin').length;

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg && !message) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Admin Users"
          title={`Kelola Pengguna ${currentUser?.name || ''}`}
          description="Tambahkan akun mahasiswa, dosen, dan admin. Admin juga dapat melakukan reset password atau menghapus akun pengguna."
          action={
            <Link href="/admin/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        {defaultPassword && (
          <Alert variant="info">
            Password default pengguna: <strong>{defaultPassword}</strong>
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard
            title="Total Pengguna"
            value={users.length}
            description="Semua akun yang terdaftar."
            icon="users"
          />

          <StatCard
            title="Mahasiswa"
            value={totalMahasiswa}
            description="Akun mahasiswa aktif."
            icon="book"
          />

          <StatCard
            title="Dosen"
            value={totalDosen}
            description="Akun dosen pembimbing."
            icon="users"
          />

          <StatCard
            title="Admin"
            value={totalAdmin}
            description="Akun administrator sistem."
            icon="check"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="app-card p-6 lg:col-span-1">
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-950">
                Tambah Pengguna
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lengkapi data dasar akun pengguna.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="app-label">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Nama pengguna"
                />
              </div>

              <div>
                <label className="app-label">Email</label>
                <input
                  type="email"
                  name="email"
                  required
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
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Dosen">Dosen</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="app-label">NIM / NIDN</label>
                <input
                  type="text"
                  name="nim_nidn"
                  value={form.nim_nidn}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Contoh: 2210631170001"
                />
              </div>

              <div>
                <label className="app-label">Password</label>
                <input
                  type="text"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Kosongkan untuk password default"
                />
              </div>

              {form.role === 'Mahasiswa' && (
                <>
                  <div>
                    <label className="app-label">Program Studi</label>
                    <select
                      name="prodi"
                      value={form.prodi}
                      onChange={handleChange}
                      className="app-input"
                    >
                      <option value="S1 Informatika">S1 Informatika</option>
                      <option value="S1 Sistem Informasi">
                        S1 Sistem Informasi
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="app-label">Semester</label>
                    <input
                      type="text"
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Contoh: 7"
                    />
                  </div>
                </>
              )}

              {form.role === 'Dosen' && (
                <div>
                  <label className="app-label">Kategori Dosen</label>
                  <input
                    type="text"
                    name="kategori_dosen"
                    value={form.kategori_dosen}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="Contoh: Pembimbing"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambah Pengguna'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="app-btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>

          <div className="app-card p-6 lg:col-span-2">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Daftar Pengguna
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cari, filter, reset password, atau hapus akun pengguna.
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
              <div>
                <label className="app-label">Cari Pengguna</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama, email, NIM, atau NIDN..."
                />
              </div>

              <div>
                <label className="app-label">Filter Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as UserRole | 'Semua')
                  }
                  className="app-input"
                >
                  <option value="Semua">Semua</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Dosen">Dosen</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-700">
                  Pengguna tidak ditemukan.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Coba ubah kata kunci pencarian atau filter role.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-950">
                            {user.name}
                          </h3>
                          <span className={getRoleBadgeClass(user.role)}>
                            {user.role}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(user.id)}
                          disabled={isSubmitting}
                          className="app-btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reset Password
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={isSubmitting}
                          className="app-btn-danger px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          NIM / NIDN
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {user.nim_nidn || '-'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Prodi
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {user.prodi || '-'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Semester
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {user.semester || '-'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Kategori Dosen
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {user.kategori_dosen || '-'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}