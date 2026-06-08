import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import PengajuanLowongan, {
  PengajuanLowonganStatus,
} from '@/models/PengajuanLowongan';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  isValidEmail,
  isValidUrl,
  optionalTrimString,
  trimString,
} from '@/lib/validators';
import {
  successResponse,
  messageResponse,
  errorResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

const allowedStatus: PengajuanLowonganStatus[] = [
  'Menunggu',
  'Disetujui',
  'Ditolak',
];

const allowedSistemKerja = ['Onsite', 'Hybrid', 'Remote'];

function parseKuota(value: unknown) {
  const kuota = Number(value);

  if (!Number.isInteger(kuota) || kuota < 1) {
    return null;
  }

  return kuota;
}

function getFormValue(formData: FormData, key: string) {
  return trimString(formData.get(key));
}

function getOptionalFormValue(formData: FormData, key: string) {
  return optionalTrimString(formData.get(key));
}

async function savePdfFile(file: File | null, folderName: string, fieldName: string) {
  if (!file || file.size === 0) {
    return null;
  }

  if (file.type !== 'application/pdf') {
    throw new Error(`${fieldName} harus berupa file PDF.`);
  }

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'pengajuan-mitra'
  );

  await mkdir(uploadDir, { recursive: true });

  const ext = 'pdf';
  const safeName = `${folderName}-${fieldName}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, safeName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/pengajuan-mitra/${safeName}`;
}

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user || (user.role !== 'Super Admin' && user.role !== 'Admin')) {
      return forbiddenResponse(
        'Akses ditolak. Hanya staff yang dapat melihat pengajuan lowongan.'
      );
    }

    const data = await PengajuanLowongan.findAll({
      order: [['createdAt', 'DESC']],
    });

    return successResponse(
      data,
      'Data pengajuan lowongan berhasil diambil.'
    );
  } catch (error) {
    console.error('GET_PENGAJUAN_LOWONGAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const formData = await request.formData();

    const nama_mitra = getFormValue(formData, 'nama_mitra');
    const alamat_mitra = getOptionalFormValue(formData, 'alamat_mitra');
    const website_mitra = getOptionalFormValue(formData, 'website_mitra');

    const nama_pic = getFormValue(formData, 'nama_pic');
    const kontak_pic = getFormValue(formData, 'kontak_pic');
    const email_pic = getOptionalFormValue(formData, 'email_pic');

    const posisi = getOptionalFormValue(formData, 'posisi') || 'Lowongan Magang';
    const deskripsi = getFormValue(formData, 'deskripsi');
    const persyaratan = getOptionalFormValue(formData, 'persyaratan');
    const lokasi = getOptionalFormValue(formData, 'lokasi');

    const sistem_kerja = getFormValue(formData, 'sistem_kerja') || 'Onsite';
    const kuota = parseKuota(getFormValue(formData, 'kuota') || 1);
    const link_pendaftaran = getOptionalFormValue(formData, 'link_pendaftaran');

    if (
      !nama_mitra ||
      !alamat_mitra ||
      !nama_pic ||
      !kontak_pic ||
      !email_pic ||
      !deskripsi ||
      !persyaratan ||
      !lokasi
    ) {
      return badRequestResponse(
        'Data mitra, narahubung, lokasi, deskripsi lowongan, dan persyaratan wajib diisi.'
      );
    }

    if (website_mitra && !isValidUrl(website_mitra)) {
      return badRequestResponse('Format website mitra tidak valid.');
    }

    if (email_pic && !isValidEmail(email_pic)) {
      return badRequestResponse('Format email PIC tidak valid.');
    }

    if (link_pendaftaran && !isValidUrl(link_pendaftaran)) {
      return badRequestResponse('Format link pendaftaran tidak valid.');
    }

    if (!/^62\d{8,15}$/.test(kontak_pic)) {
      return badRequestResponse(
        'Nomor kontak PIC harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
    }

    if (!allowedSistemKerja.includes(sistem_kerja)) {
      return badRequestResponse('Sistem kerja tidak valid.');
    }

    if (!kuota) {
      return badRequestResponse('Kuota harus berupa angka minimal 1.');
    }

    const folderName = nama_mitra
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const dokumen_akta_pendirian = await savePdfFile(
      formData.get('dokumen_akta_pendirian') as File | null,
      folderName,
      'akta-pendirian'
    );

    const dokumen_akta_direksi = await savePdfFile(
      formData.get('dokumen_akta_direksi') as File | null,
      folderName,
      'akta-direksi'
    );

    const dokumen_ktp_penandatangan = await savePdfFile(
      formData.get('dokumen_ktp_penandatangan') as File | null,
      folderName,
      'ktp-penandatangan'
    );

    const dokumen_npwp = await savePdfFile(
      formData.get('dokumen_npwp') as File | null,
      folderName,
      'npwp'
    );

    const dokumen_izin_usaha = await savePdfFile(
      formData.get('dokumen_izin_usaha') as File | null,
      folderName,
      'izin-usaha'
    );

    if (
      !dokumen_akta_pendirian ||
      !dokumen_akta_direksi ||
      !dokumen_ktp_penandatangan ||
      !dokumen_npwp ||
      !dokumen_izin_usaha
    ) {
      return badRequestResponse(
        'Semua dokumen pendukung wajib diunggah dalam format PDF.'
      );
    }

    const pengajuan = await PengajuanLowongan.create({
  nama_mitra,
  alamat_mitra,
  website_mitra,

  nama_pic,
  kontak_pic,
  email_pic,

  posisi,
  deskripsi,
  persyaratan,
  lokasi,
  sistem_kerja,

  tipe_konversi: 'Konversi 20 SKS',

  kuota,
  link_pendaftaran,

  link_akta_pendirian: null,
  link_akta_direksi: null,
  link_ktp_penandatangan: null,
  link_npwp: null,
  link_izin_usaha: null,

  status: 'Menunggu',
  catatan_super_admin: null,
});

    return successResponse(
      pengajuan,
      'Pengajuan mitra berhasil dikirim. Staff akan memeriksa data dan dokumen terlebih dahulu.',
      201
    );
  } catch (error) {
    console.error('CREATE_PENGAJUAN_LOWONGAN_ERROR:', error);

    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan server.';

    return badRequestResponse(message);
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user || (user.role !== 'Super Admin' && user.role !== 'Admin')) {
      return forbiddenResponse(
        'Akses ditolak. Hanya staff yang dapat memverifikasi pengajuan lowongan.'
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const status = body.status as PengajuanLowonganStatus;
    const catatan_super_admin =
      optionalTrimString(body.catatan_super_admin) || null;

    if (!id || Number.isNaN(id) || !status) {
      return badRequestResponse('ID dan status wajib dikirim.');
    }

    if (!allowedStatus.includes(status)) {
      return badRequestResponse('Status pengajuan lowongan tidak valid.');
    }

    if (status === 'Ditolak' && !catatan_super_admin) {
      return badRequestResponse(
        'Catatan staff wajib diisi jika pengajuan lowongan ditolak.'
      );
    }

    const pengajuan = await PengajuanLowongan.findByPk(id);

    if (!pengajuan) {
      return notFoundResponse('Pengajuan lowongan tidak ditemukan.');
    }

    await pengajuan.update({
      status,
      catatan_super_admin,
    });

    return messageResponse('Status pengajuan lowongan berhasil diperbarui.');
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_LOWONGAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}