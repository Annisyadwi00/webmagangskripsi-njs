"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profil');

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      
      {/* Header Navigation (Simpel) */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-gray-500 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pengaturan Profil</h1>
            <p className="text-sm text-gray-500">Kelola informasi pribadi dan preferensi akun Anda</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Menu Pengaturan */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {['Profil', 'Keamanan', 'Notifikasi', 'Tampilan'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-50 text-[#1e3a8a]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {/* Ikon dinamis berdasarkan nama tab */}
                  {tab === 'Profil' && <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                  {tab === 'Keamanan' && <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                  {tab === 'Notifikasi' && <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                  {tab === 'Tampilan' && <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                  {tab}
                </button>
              ))}
            </nav>
          </aside>

          {/* Area Konten Pengaturan */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* --- TAB PROFIL --- */}
            {activeTab === 'Profil' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Pribadi</h2>
                
                {/* Foto Profil Area */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <img src="https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=1e3a8a&color=fff&size=128" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-[#1e3a8a] text-white rounded-full border-2 border-white hover:bg-blue-800 transition-colors shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Ahmad Fauzi</h3>
                    <p className="text-sm text-gray-500">NIM: 1957201001</p>
                    <button className="mt-2 text-sm text-[#1e3a8a] font-medium hover:underline">Ubah Foto Profil</button>
                  </div>
                </div>

                {/* Form Data */}
                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input type="text" defaultValue="Ahmad Fauzi" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                      <input type="text" defaultValue="1957201001" disabled className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg sm:text-sm cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" defaultValue="ahmad.fauzi@student.unsika.ac.id" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                      <input type="date" defaultValue="2002-05-15" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                      <input type="tel" defaultValue="081234567890" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                      <textarea rows={3} defaultValue="Jl. HS. Ronggowaluyo, Telukjambe Timur, Karawang" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm"></textarea>
                    </div>
                  </div>

                  <hr className="my-6 border-gray-100" />
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Magang</h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan / Instansi</label>
                      <input type="text" defaultValue="PT Digital Teknologi Indonesia" disabled className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg sm:text-sm cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                      <input type="text" defaultValue="01 Februari 2026" disabled className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg sm:text-sm cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm">
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- TAB NOTIFIKASI --- */}
            {activeTab === 'Notifikasi' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Pengaturan Notifikasi</h2>
                <p className="text-sm text-gray-500 mb-8">Pilih pemberitahuan apa saja yang ingin Anda terima.</p>
                
                <div className="space-y-6">
                  {/* Toggle Item */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Persetujuan Logbook</h4>
                      <p className="text-xs text-gray-500 mt-1">Notifikasi saat logbook disetujui atau ditolak</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Pengingat Deadline</h4>
                      <p className="text-xs text-gray-500 mt-1">Pengingat untuk deadline laporan dan tugas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Pengumuman Baru</h4>
                      <p className="text-xs text-gray-500 mt-1">Notifikasi untuk pengumuman dari dosen atau admin</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notifikasi Email</h4>
                      <p className="text-xs text-gray-500 mt-1">Terima salinan notifikasi melalui email terdaftar</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                    </label>
                  </div>

                  <div className="pt-6">
                    <button className="px-6 py-2.5 bg-[#1e3a8a] text-white font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm">
                      Simpan Pengaturan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB TAMPILAN --- */}
            {activeTab === 'Tampilan' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tampilan & Tema</h2>
                <p className="text-sm text-gray-500 mb-8">Sesuaikan tampilan aplikasi sesuai preferensi Anda.</p>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-800 text-white rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Mode Gelap</h4>
                      <p className="text-xs text-gray-500 mt-1">Aktifkan mode gelap untuk pengalaman yang lebih nyaman di mata</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                  </label>
                </div>
              </div>
            )}

            {/* --- TAB KEAMANAN --- */}
            {activeTab === 'Keamanan' && (
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Keamanan Akun</h2>
                <p className="text-sm text-gray-500 mb-8">Pastikan password Anda kuat dan unik untuk menjaga keamanan akun.</p>
                
                <form className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                    <input type="password" placeholder="••••••••" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                    <input type="password" placeholder="Minimal 8 karakter" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                    <input type="password" placeholder="Ulangi password baru" className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm" />
                  </div>
                  <div className="pt-2">
                    <button type="button" className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm">
                      Ganti Password
                    </button>
                  </div>
                </form>

                <hr className="my-8 border-gray-100" />
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Autentikasi Dua Faktor (2FA)</h4>
                    <p className="text-xs text-gray-500 mt-1">Tambahkan lapisan keamanan ekstra untuk akun Anda</p>
                  </div>
                  <button className="px-4 py-2 border border-[#1e3a8a] text-[#1e3a8a] font-medium text-sm rounded-lg hover:bg-blue-50 transition-colors">
                    Aktifkan 2FA
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}