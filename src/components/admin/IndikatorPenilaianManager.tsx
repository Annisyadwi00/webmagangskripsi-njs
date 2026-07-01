"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import {
  IndikatorPenilaianItem,
  getIndikatorList,
  createIndikator,
  updateIndikator,
  deleteIndikator,
} from '@/lib/indikator-client';

type IndikatorForm = {
  id?: number;
  tipe: 'dospem' | 'penguji' | 'mitra';
  label: string;
  bobot: number;
  urutan: number;
  kode: string;
  aktif: boolean;
};

const initialForm: IndikatorForm = {
  tipe: 'dospem',
  label: '',
  bobot: 0,
  urutan: 1,
  kode: '',
  aktif: true,
};

export default function IndikatorPenilaianManager() {
  const [items, setItems] = useState<IndikatorPenilaianItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dospem' | 'penguji' | 'mitra'>('dospem');
  const [filterProdi, setFilterProdi] = useState<'ALL' | 'IF' | 'SI'>('ALL');
  const [filterSemester, setFilterSemester] = useState<'ALL' | '5' | '6' | '7'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<IndikatorForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback Messages
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const data = await getIndikatorList();
      setItems(data || []);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Gagal mengambil data indikator.';
      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tab: 'dospem' | 'penguji' | 'mitra') => {
    setActiveTab(tab);
    setFilterProdi('ALL');
    setFilterSemester('ALL');
  };

  // Filtered items based on activeTab, search, prodi, and semester
  const tabItems = items.filter((it) => it.tipe === activeTab);
  const filteredItems = tabItems.filter((it) => {
    const matchSearch =
      it.label.toLowerCase().includes(search.toLowerCase()) ||
      it.kode.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (activeTab === 'penguji') {
      if (filterProdi === 'IF') {
        const isIF =
          it.label.includes('Informatika') ||
          it.kode.toLowerCase().startsWith('if_') ||
          it.kode.toLowerCase().startsWith('ti_');
        if (!isIF) return false;
      } else if (filterProdi === 'SI') {
        const isSI =
          it.label.includes('Sistem Informasi') ||
          it.kode.toLowerCase().startsWith('si_');
        if (!isSI) return false;
      }

      if (filterSemester !== 'ALL') {
        const matchSem =
          it.label.includes(`Sem ${filterSemester}`) ||
          it.kode.toLowerCase().includes(`_s${filterSemester}_`);
        if (!matchSem) return false;
      }
    }

    return true;
  });

  const renderLabelWithBadge = (label: string) => {
    const match = label.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      const badgeText = match[1];
      const mainText = match[2];
      const isIF = badgeText.includes('Informatika');
      return (
        <div className="space-y-1.5 py-1">
          <span
            className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase ${
              isIF
                ? 'bg-blue-100 text-[#1e3a8a] border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
                : 'bg-purple-100 text-purple-900 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800'
            }`}
          >
            {badgeText}
          </span>
          <p className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
            {mainText}
          </p>
        </div>
      );
    }
    return <span className="font-bold text-slate-950 dark:text-white">{label}</span>;
  };

  const dospemCount = items.filter((i) => i.tipe === 'dospem').length;
  const pengujiCount = items.filter((i) => i.tipe === 'penguji').length;
  const mitraCount = items.filter((i) => i.tipe === 'mitra').length;

  const handleOpenCreate = () => {
    const nextUrutan = tabItems.length > 0 ? Math.max(...tabItems.map((i) => i.urutan || 0)) + 1 : 1;
    setForm({
      ...initialForm,
      tipe: activeTab,
      urutan: nextUrutan,
    });
    setIsEditing(false);
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: IndikatorPenilaianItem) => {
    setForm({
      id: item.id,
      tipe: (item.tipe as 'dospem' | 'penguji' | 'mitra') || 'dospem',
      label: item.label || '',
      bobot: item.bobot || 0,
      urutan: item.urutan || 1,
      kode: item.kode || '',
      aktif: item.aktif ?? true,
    });
    setIsEditing(true);
    setModalError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setModalError('Judul / Label indikator wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      if (isEditing && form.id) {
        await updateIndikator(form.id, {
          label: form.label,
          bobot: form.bobot,
          urutan: form.urutan,
          aktif: form.aktif,
        });
        setMessage('Indikator berhasil diperbarui.');
      } else {
        await createIndikator({
          tipe: form.tipe,
          label: form.label,
          bobot: form.bobot,
          urutan: form.urutan,
          kode: form.kode,
        });
        setMessage('Indikator penilaian baru berhasil ditambahkan.');
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Gagal menyimpan indikator.';
      setModalError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAktif = async (item: IndikatorPenilaianItem) => {
    try {
      await updateIndikator(item.id, {
        aktif: !item.aktif,
      });
      setMessage(`Status indikator "${item.label}" berhasil diubah.`);
      await fetchData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Gagal mengubah status indikator.';
      setErrorMsg(errMsg);
    }
  };

  const handleDelete = async (item: IndikatorPenilaianItem) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus indikator "${item.label}"? Data penilaian lama yang sudah menggunakan indikator ini tetap tersimpan di histori.`
    );
    if (!confirmed) return;

    try {
      await deleteIndikator(item.id);
      setMessage(`Indikator "${item.label}" berhasil dihapus.`);
      await fetchData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Gagal menghapus indikator.';
      setErrorMsg(errMsg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Indikator Penilaian"
        description="Sesuaikan judul, label, dan kriteria komponen evaluasi yang akan dinilai oleh Dosen Pembimbing (Dospem), Dosen Penguji, maupun Mitra Lapangan."
        action={
          <button onClick={handleOpenCreate} className="app-btn-primary flex items-center gap-2">
            <span>+ Tambah Indikator Baru</span>
          </button>
        }
      />

      {message && (
        <Alert variant="success">
          {message}
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="error">
          {errorMsg}
        </Alert>
      )}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div onClick={() => handleTabChange('dospem')} className={`cursor-pointer transition-transform hover:scale-[1.02] ${activeTab === 'dospem' ? 'ring-2 ring-[#1e3a8a] dark:ring-blue-400 rounded-2xl' : ''}`}>
          <StatCard
            title="Indikator Dospem"
            value={dospemCount}
            description="Penilaian oleh Dosen Pembimbing"
            icon="book"
          />
        </div>
        <div onClick={() => handleTabChange('penguji')} className={`cursor-pointer transition-transform hover:scale-[1.02] ${activeTab === 'penguji' ? 'ring-2 ring-[#1e3a8a] dark:ring-blue-400 rounded-2xl' : ''}`}>
          <StatCard
            title="Indikator Penguji"
            value={pengujiCount}
            description="Penilaian saat Sidang / Ujian"
            icon="document"
          />
        </div>
        <div onClick={() => handleTabChange('mitra')} className={`cursor-pointer transition-transform hover:scale-[1.02] ${activeTab === 'mitra' ? 'ring-2 ring-[#1e3a8a] dark:ring-blue-400 rounded-2xl' : ''}`}>
          <StatCard
            title="Indikator Mitra"
            value={mitraCount}
            description="Penilaian Pembimbing Lapangan"
            icon="briefcase"
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="app-card p-2 sm:p-3">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3 px-2 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTabChange('dospem')}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === 'dospem'
                  ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/20 dark:bg-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Dosen Pembimbing (Dospem)
            </button>
            <button
              onClick={() => handleTabChange('penguji')}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === 'penguji'
                  ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/20 dark:bg-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Dosen Penguji
            </button>
            <button
              onClick={() => handleTabChange('mitra')}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === 'mitra'
                  ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/20 dark:bg-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Mitra Lapangan
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari indikator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input text-sm py-2"
            />
          </div>
        </div>

        {/* Filter Khusus Dosen Penguji (IF vs SI & Semester) */}
        {activeTab === 'penguji' && (
          <div className="mt-4 mx-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50/60 p-4 border border-blue-100 dark:bg-slate-800/50 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Program Studi:
              </span>
              <div className="flex rounded-xl bg-white p-1 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                <button
                  onClick={() => setFilterProdi('ALL')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filterProdi === 'ALL'
                      ? 'bg-[#1e3a8a] text-white shadow-sm dark:bg-blue-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Semua Prodi
                </button>
                <button
                  onClick={() => setFilterProdi('IF')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filterProdi === 'IF'
                      ? 'bg-[#1e3a8a] text-white shadow-sm dark:bg-blue-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  S1 Informatika
                </button>
                <button
                  onClick={() => setFilterProdi('SI')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filterProdi === 'SI'
                      ? 'bg-[#1e3a8a] text-white shadow-sm dark:bg-blue-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  S1 Sistem Informasi
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Semester:
              </span>
              <div className="flex rounded-xl bg-white p-1 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                {(['ALL', '5', '6', '7'] as const).map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setFilterSemester(sem)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                      filterSemester === sem
                        ? 'bg-[#1e3a8a] text-white shadow-sm dark:bg-blue-600'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {sem === 'ALL' ? 'Semua Sem' : `Semester ${sem}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table List */}
        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Memuat daftar indikator penilaian...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Belum ada indikator penilaian untuk kategori ini.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="py-3 px-4 font-bold">Urutan</th>
                  <th className="py-3 px-4 font-bold">Judul / Label Form Penilaian</th>
                  <th className="py-3 px-4 font-bold">Kode Key</th>
                  <th className="py-3 px-4 font-bold">Bobot</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {item.urutan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {renderLabelWithBadge(item.label)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {item.kode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {item.tipe === 'mitra' ? `${item.bobot}%` : '- (Rata-rata)'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          item.aktif
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.aktif ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {item.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleAktif(item)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          title={item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1e3a8a] hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal Form */}
      {showModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {isEditing ? 'Edit Indikator Penilaian' : 'Tambah Indikator Baru'}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <div className="mt-4">
                  <Alert variant="error">{modalError}</Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="app-label">Kategori / Tipe Penilaian</label>
                  <select
                    value={form.tipe}
                    onChange={(e) => setForm({ ...form, tipe: e.target.value as any })}
                    disabled={isEditing}
                    className="app-input bg-slate-50 disabled:opacity-60"
                  >
                    <option value="dospem">Dosen Pembimbing (Dospem)</option>
                    <option value="penguji">Dosen Penguji</option>
                    <option value="mitra">Mitra Lapangan</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">Judul / Label Form Penilaian</label>
                  <input
                    type="text"
                    required
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="app-input"
                    placeholder="Contoh: Laporan, Analisis Sistem, Kedisiplinan..."
                  />
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    Teks ini yang akan tampil sebagai judul / label pertanyaan di form evaluasi dosen/mitra.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="app-label">Urutan Tampil</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.urutan}
                      onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">Bobot (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={form.bobot}
                      onChange={(e) => setForm({ ...form, bobot: parseFloat(e.target.value) || 0 })}
                      disabled={form.tipe !== 'mitra'}
                      className="app-input disabled:bg-slate-100 disabled:opacity-60 dark:disabled:bg-slate-800"
                    />
                    {form.tipe !== 'mitra' && (
                      <p className="mt-1 text-[10px] text-slate-400">
                        *Dospem/Penguji dihitung rata-rata (bobot 0).
                      </p>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div>
                    <label className="app-label flex items-center justify-between">
                      <span>Kode Key Sistem (Opsional)</span>
                      <span className="text-[11px] font-normal text-slate-400">Auto-generate jika kosong</span>
                    </label>
                    <input
                      type="text"
                      value={form.kode}
                      onChange={(e) => setForm({ ...form, kode: e.target.value })}
                      className="app-input font-mono text-xs"
                      placeholder="contoh: laporan_magang"
                    />
                  </div>
                )}

                {isEditing && (
                  <div>
                    <label className="app-label">Kode Key Sistem</label>
                    <input
                      type="text"
                      value={form.kode}
                      disabled
                      className="app-input font-mono text-xs bg-slate-100 text-slate-400 opacity-70 dark:bg-slate-800"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      *Kode unik tidak dapat diubah agar kompatibilitas histori nilai mahasiswa lama tetap terjaga.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="aktifCheckbox"
                    checked={form.aktif}
                    onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                  />
                  <label htmlFor="aktifCheckbox" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Aktifkan indikator ini di form penilaian
                  </label>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="app-btn-primary flex-1 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Indikator'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="app-btn-secondary flex-1"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
