"use client";

import { useEffect, useState } from 'react';
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>(initialForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const data = await getUsers();
      setUsers(data);
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
    fetchUsers();
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
        name: form.name,
        email: form.email,
        password: form.password || null,
        role: form.role,
        nim_nidn: form.nim_nidn || '-',
        prodi: form.role === 'Mahasiswa' ? form.prodi : null,
        semester: form.role === 'Mahasiswa' ? form.semester : null,
        kategori_dosen: form.role === 'Dosen' ? form.kategori_dosen : null,
      });

      setMessage(result.message || 'Pengguna berhasil ditambahkan.');

      if (result.data?.defaultPassword) {
        setDefaultPassword(result.data.defaultPassword);
      }

      resetForm();
      await fetchUsers();
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

      await fetchUsers();
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
      await fetchUsers();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menghapus pengguna.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Memuat data pengguna...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Kelola Pengguna
        </h1>
        <p className="text-gray-500 mt-1">
          Tambahkan pengguna, reset password, dan hapus akun pengguna.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 font-medium">
          {message}
        </div>
      )}

      {defaultPassword && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700 font-medium">
          Password default: <strong>{defaultPassword}</strong>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Tambah Pengguna
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              >
                <option value="Mahasiswa">Mahasiswa</option>
                <option value="Dosen">Dosen</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                NIM / NIDN
              </label>
              <input
                type="text"
                name="nim_nidn"
                value={form.nim_nidn}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                placeholder="-"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                placeholder="Kosongkan untuk password default"
              />
            </div>
          </div>

          {form.role === 'Mahasiswa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Program Studi
                </label>
                <select
                  name="prodi"
                  value={form.prodi}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                >
                  <option value="S1 Informatika">S1 Informatika</option>
                  <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  placeholder="Contoh: 7"
                />
              </div>
            </div>
          )}

          {form.role === 'Dosen' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kategori Dosen
              </label>
              <input
                type="text"
                name="kategori_dosen"
                value={form.kategori_dosen}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                placeholder="Contoh: Pembimbing"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-blue-900 disabled:opacity-60"
          >
            {isSubmitting ? 'Menyimpan...' : 'Tambah Pengguna'}
          </button>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Daftar Pengguna
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-500">Belum ada pengguna.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4 text-left">Nama</th>
                  <th className="px-5 py-4 text-left">Email</th>
                  <th className="px-5 py-4 text-left">Role</th>
                  <th className="px-5 py-4 text-left">NIM/NIDN</th>
                  <th className="px-5 py-4 text-left">Prodi/Kategori</th>
                  <th className="px-5 py-4 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="align-top">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {user.name}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {user.nim_nidn}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {user.role === 'Mahasiswa'
                        ? user.prodi || '-'
                        : user.role === 'Dosen'
                          ? user.kategori_dosen || '-'
                          : '-'}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(user.id)}
                          disabled={isSubmitting}
                          className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 font-bold hover:bg-yellow-100 disabled:opacity-60"
                        >
                          Reset Password
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={isSubmitting}
                          className="px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 disabled:opacity-60"
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
      </section>
    </main>
  );
}