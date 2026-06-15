import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import busboy from 'busboy';
import PengajuanMitra from '@/models/PengajuanMitra';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

type PengajuanMitraStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';
const allowedStatus: PengajuanMitraStatus[] = ['Menunggu', 'Disetujui', 'Ditolak'];
const allowedSistemKerja = ['Onsite', 'Hybrid', 'Remote'];


async function parseFormData(request: Request): Promise<{
  fields: Record<string, string>;
  files: Record<string, File>;
}> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type harus multipart/form-data');
  }

  const body = await request.arrayBuffer();
  const buffer = Buffer.from(body);

  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: { 'content-type': contentType } });
    const fields: Record<string, string> = {};
    const files: Record<string, File> = {};

    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('file', (name, file, info) => {
      const chunks: Buffer[] = [];
      file.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const fileObj = new File([buffer], info.filename, { type: info.mimeType });
        files[name] = fileObj;
      });
    });

    bb.on('close', () => {
      resolve({ fields, files });
    });

    bb.on('error', (err) => reject(err));
    bb.end(buffer);
  });
}

async function saveFile(file: File, prefix: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public/uploads/mitra');
  await mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = `${prefix}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/mitra/${safeName}`;
}

function isValidUrl(value: string | null) {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value: string | null) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^62\d{8,15}$/.test(value);
}

function isStaffRole(role?: string | null) {
  return role === 'Admin' || role === 'Super Admin';
}

export async function GET() {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 401 });
    }

    if (isStaffRole(user.role)) {
      const data = await PengajuanMitra.findAll({ order: [['createdAt', 'DESC']] });
      return NextResponse.json({ success: true, message: 'Data berhasil diambil.', data }, { status: 200 });
    }

    if (user.role === 'Mahasiswa') {
      const data = await PengajuanMitra.findAll({ where: { user_id: user.id }, order: [['createdAt', 'DESC']] });
      return NextResponse.json({ success: true, message: 'Data berhasil diambil.', data }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Role tidak memiliki akses.' }, { status: 403 });
  } catch (error) {
    console.error('GET_PENGAJUAN_MITRA_ERROR:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Silakan login.' }, { status: 401 });
    }
    if (user.role !== 'Mahasiswa') {
      return NextResponse.json({ success: false, message: 'Hanya mahasiswa yang dapat mengajukan mitra.' }, { status: 403 });
    }

    const { fields, files } = await parseFormData(request);

    // Ambil field yang diperlukan
    const nama_mitra = fields.nama_mitra?.trim();
    const alamat_kantor_mitra = fields.alamat_kantor_mitra?.trim();
    const url_mitra = fields.url_mitra?.trim() || null;
    const nama_narahubung_mitra = fields.nama_narahubung_mitra?.trim();
    const kontak_narahubung_mitra = fields.kontak_narahubung_mitra?.trim();
    const email_perusahaan = fields.email_perusahaan?.trim();
    const lokasi = fields.lokasi?.trim();
    const sistem_kerja = fields.sistem_kerja;
    const kuota = Number(fields.kuota);
    const link_pendaftaran = fields.link_pendaftaran?.trim() || null;
    const deskripsi_lowongan = fields.deskripsi_lowongan?.trim();
    const persyaratan = fields.persyaratan?.trim();
    const nama_mahasiswa_pengusul = fields.nama_mahasiswa_pengusul?.trim() || user.name;
    const npm_mahasiswa_pengusul = fields.npm_mahasiswa_pengusul?.trim();
    const program_studi_mahasiswa = fields.program_studi_mahasiswa?.trim();
    const angkatan_mahasiswa = fields.angkatan_mahasiswa?.trim();
    const kontak_mahasiswa = fields.kontak_mahasiswa?.trim();
    const kelas = fields.kelas?.trim();

    // Latitude & Longitude
    const latitude = fields.latitude ? parseFloat(fields.latitude) : null;
    const longitude = fields.longitude ? parseFloat(fields.longitude) : null;

    // Validasi mandatory fields
    if (
      !nama_mitra || !alamat_kantor_mitra || !nama_narahubung_mitra ||
      !kontak_narahubung_mitra || !email_perusahaan || !lokasi || !sistem_kerja ||
      !deskripsi_lowongan || !persyaratan || !nama_mahasiswa_pengusul ||
      !npm_mahasiswa_pengusul || !program_studi_mahasiswa || !angkatan_mahasiswa ||
      !kontak_mahasiswa || !kelas
    ) {
      return NextResponse.json({ success: false, message: 'Semua field wajib diisi.' }, { status: 400 });
    }

    if (!allowedSistemKerja.includes(sistem_kerja)) {
      return NextResponse.json({ success: false, message: 'Sistem kerja tidak valid.' }, { status: 400 });
    }

    if (!Number.isInteger(kuota) || kuota < 1) {
      return NextResponse.json({ success: false, message: 'Kuota harus angka minimal 1.' }, { status: 400 });
    }

    if (url_mitra && !isValidUrl(url_mitra)) {
      return NextResponse.json({ success: false, message: 'Format URL mitra tidak valid.' }, { status: 400 });
    }
    if (link_pendaftaran && !isValidUrl(link_pendaftaran)) {
      return NextResponse.json({ success: false, message: 'Format link pendaftaran tidak valid.' }, { status: 400 });
    }
    if (!isValidEmail(email_perusahaan)) {
      return NextResponse.json({ success: false, message: 'Format email narahubung tidak valid.' }, { status: 400 });
    }
    if (!isValidPhone(kontak_narahubung_mitra)) {
      return NextResponse.json({ success: false, message: 'Nomor kontak narahubung harus diawali 62.' }, { status: 400 });
    }
    if (!isValidPhone(kontak_mahasiswa)) {
      return NextResponse.json({ success: false, message: 'Nomor kontak mahasiswa harus diawali 62.' }, { status: 400 });
    }

    // Validasi latitude/longitude (jika diisi)
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      return NextResponse.json({ success: false, message: 'Latitude harus antara -90 dan 90.' }, { status: 400 });
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      return NextResponse.json({ success: false, message: 'Longitude harus antara -180 dan 180.' }, { status: 400 });
    }

    // Validasi file PDF (semua harus ada)
    const requiredFiles = ['akta_pendirian', 'akta_direksi', 'ktp_penandatangan', 'npwp_perusahaan', 'izin_usaha'];
    for (const fileKey of requiredFiles) {
      if (!files[fileKey]) {
        return NextResponse.json({ success: false, message: `Dokumen ${fileKey} wajib diunggah.` }, { status: 400 });
      }
      if (files[fileKey].type !== 'application/pdf') {
        return NextResponse.json({ success: false, message: `Dokumen ${fileKey} harus PDF.` }, { status: 400 });
      }
    }

    // Upload semua file
    const link_akta_pendirian = await saveFile(files.akta_pendirian, 'akta_pendirian');
    const link_akta_direksi = await saveFile(files.akta_direksi, 'akta_direksi');
    const link_ktp_penandatangan = await saveFile(files.ktp_penandatangan, 'ktp');
    const link_npwp = await saveFile(files.npwp_perusahaan, 'npwp');
    const link_izin_usaha = await saveFile(files.izin_usaha, 'izin_usaha');

    // Simpan ke database
    const newPengajuanMitra = await PengajuanMitra.create({
      user_id: user.id,
      nama_mitra,
      alamat_kantor_mitra,
      url_mitra,
      nama_narahubung_mitra,
      kontak_narahubung_mitra,
      email_perusahaan,
      lokasi,
      sistem_kerja,
      kuota,
      link_pendaftaran,
      deskripsi_lowongan,
      persyaratan,
      link_akta_pendirian,
      link_akta_direksi,
      link_ktp_penandatangan,
      link_npwp,
      link_izin_usaha,
      nama_mahasiswa_pengusul,
      npm_mahasiswa_pengusul,
      program_studi_mahasiswa,
      angkatan_mahasiswa,
      kontak_mahasiswa,
      kelas,
      latitude,
      longitude,
      status: 'Menunggu',
      catatan_admin: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Pengajuan mitra berhasil dikirim dan akan diperiksa oleh staff.',
      data: newPengajuanMitra,
    }, { status: 201 });

  } catch (error) {
    console.error('CREATE_PENGAJUAN_MITRA_ERROR:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 401 });
    }
    if (!isStaffRole(user.role)) {
      return NextResponse.json({ success: false, message: 'Hanya staff yang dapat memverifikasi.' }, { status: 403 });
    }

    const body = await request.json();
    const id = Number(body.id);
    const status = body.status as PengajuanMitraStatus;
    const catatan_admin = body.catatan_admin?.trim() || null;

    if (!id || Number.isNaN(id) || !status) {
      return NextResponse.json({ success: false, message: 'ID dan status wajib dikirim.' }, { status: 400 });
    }
    if (!allowedStatus.includes(status)) {
      return NextResponse.json({ success: false, message: 'Status tidak valid.' }, { status: 400 });
    }
    if (status === 'Ditolak' && !catatan_admin) {
      return NextResponse.json({ success: false, message: 'Catatan staff wajib diisi jika ditolak.' }, { status: 400 });
    }

    const pengajuanMitra = await PengajuanMitra.findByPk(id);
    if (!pengajuanMitra) {
      return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 });
    }

    await pengajuanMitra.update({ status, catatan_admin });

    return NextResponse.json({ success: true, message: 'Status berhasil diperbarui.' }, { status: 200 });
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_MITRA_ERROR:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}