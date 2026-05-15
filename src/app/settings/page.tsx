"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';

type ActiveTab = 'profil' | 'keamanan';

type ProfileForm = {
  name: string;
  email: string;
  role: string;
  nim_nidn: string;
  prodi: string;
  phone: string;
  photo: string;
  semester: string;
  kategori_dosen: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialProfileForm: ProfileForm = {
  name: '',
  email: '',
  role: '',
  nim_nidn: '',
  prodi: '',
  phone: '',
  photo: '',
  semester: '',
  kategori_dosen: '',
};

const initialPasswordForm: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profil');

  const [profileForm, setProfileForm] =
    useState<ProfileForm>(initialProfileForm);

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(initialPasswordForm);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getBackPath = (role?: string) => {
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Dosen') return '/dosen/dashboard';

    return '/dashboard';
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const user = await getCurrentUserClient();

      setCurrentUser(user);
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        nim_nidn: user.nim_nidn || '',
        prodi: user.prodi || '',
        phone: user.phone || '',
        photo: user.photo || '',
        semester: user.semester || '',
        kategori_dosen: user.kategori_dosen || '',
      });
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal mengambil data profil.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleProfileChange = (field: keyof ProfileForm, value: string) => {
    setProfileForm({
      ...profileForm,
      [field]: value,
    });
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm({
      ...passwordForm,
      [field]: value,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 2MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrorMsg('Format foto harus JPG atau PNG.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileForm({
        ...profileForm,
        photo: String(reader.result || ''),
      });
    };

    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmittingProfile(true);
    setMessage('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_profile',
          name: profileForm.name,
          phone: profileForm.phone,
          photo: profileForm.photo || null,
          semester: profileForm.semester,
          kategori_dosen: profileForm.kategori_dosen,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal memperbarui profil.');
      }

      setMessage(result.message || 'Profil berhasil diperbarui.');
      await fetchUser();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal memperbarui profil.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmittingPassword(true);
    setMessage('');
    setErrorMsg('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak sesuai.');
      setIsSubmittingPassword(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMsg('Password baru minimal 8 karakter.');
      setIsSubmittingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal mengubah password.');
      }

      setMessage(result.message || 'Password berhasil diubah.');
      setPasswordForm(initialPasswordForm);
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal mengubah password.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-72 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 h-80 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg && !currentUser) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="app-btn-primary"
          >
            Kembali ke Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="app-container">
        <PageHeader
          eyebrow="Settings"
          title="Pengaturan Akun"
          description="Kelola profil pengguna, foto profil, dan kata sandi akun SI Magang."
          action={
            <button
              type="button"
              onClick={() => router.push(getBackPath(currentUser?.role))}
              className="app-btn-secondary"
            >
              Kembali ke Dashboard
            </button>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="app-card p-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 text-xl font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                {profileForm.photo ? (
                  <img
                    src={profileForm.photo}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profileForm.name.charAt(0).toUpperCase() || 'U'
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-black text-slate-950 dark:text-white">
                  {profileForm.name || '-'}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                  {profileForm.role || '-'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setActiveTab('profil')}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-black ${
                  activeTab === 'profil'
                    ? 'bg-blue-50 text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                Profil User
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('keamanan')}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-black ${
                  activeTab === 'keamanan'
                    ? 'bg-blue-50 text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                Ganti Kata Sandi
              </button>
            </div>
          </aside>

          {activeTab === 'profil' && (
            <section className="app-card animate-fade-up p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  Profil User
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Perbarui nama, nomor WhatsApp, foto profil, dan informasi
                  tambahan sesuai role.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70 md:flex-row md:items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 text-3xl font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                    {profileForm.photo ? (
                      <img
                        src={profileForm.photo}
                        alt="Foto profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profileForm.name.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-black text-slate-950 dark:text-white">
                      Foto Profil
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Gunakan JPG atau PNG. Maksimal 2MB.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="app-btn-secondary"
                      >
                        Pilih Foto
                      </button>

                      {profileForm.photo && (
                        <button
                          type="button"
                          onClick={() => handleProfileChange('photo', '')}
                          className="app-btn-danger"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) =>
                        handleProfileChange('name', e.target.value)
                      }
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">Email</label>
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="app-input cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div>
                    <label className="app-label">
                      {profileForm.role === 'Dosen' ? 'NIDN' : 'NIM'}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profileForm.nim_nidn}
                      className="app-input cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div>
                    <label className="app-label">Nomor WhatsApp</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) =>
                        handleProfileChange(
                          'phone',
                          e.target.value.replace(/[^0-9]/g, '')
                        )
                      }
                      className="app-input"
                      placeholder="081234567890"
                    />
                  </div>

                  {profileForm.role === 'Mahasiswa' && (
                    <div>
                      <label className="app-label">Semester</label>
                      <select
                        value={profileForm.semester}
                        onChange={(e) =>
                          handleProfileChange('semester', e.target.value)
                        }
                        className="app-input"
                      >
                        <option value="">Pilih Semester</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                    </div>
                  )}

                  {profileForm.role === 'Dosen' && (
                    <div>
                      <label className="app-label">Kategori Dosen</label>
                      <input
                        type="text"
                        value={profileForm.kategori_dosen}
                        onChange={(e) =>
                          handleProfileChange(
                            'kategori_dosen',
                            e.target.value
                          )
                        }
                        className="app-input"
                        placeholder="Contoh: Web Development"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'keamanan' && (
            <section className="app-card animate-fade-up p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  Ganti Kata Sandi
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Gunakan password baru minimal 8 karakter dan berbeda dari
                  password lama.
                </p>
              </div>

              <form
                onSubmit={handleUpdatePassword}
                className="max-w-xl space-y-5"
              >
                <div>
                  <label className="app-label">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange(
                          'currentPassword',
                          e.target.value
                        )
                      }
                      className="app-input pr-24"
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-black text-[#1e3a8a] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-400/10"
                    >
                      {showPassword.current ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="app-label">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        handlePasswordChange('newPassword', e.target.value)
                      }
                      className="app-input pr-24"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-black text-[#1e3a8a] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-400/10"
                    >
                      {showPassword.new ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="app-label">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange(
                          'confirmPassword',
                          e.target.value
                        )
                      }
                      className="app-input pr-24"
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-black text-[#1e3a8a] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-400/10"
                    >
                      {showPassword.confirm ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingPassword
                    ? 'Menyimpan...'
                    : 'Simpan Password'}
                </button>
              </form>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}