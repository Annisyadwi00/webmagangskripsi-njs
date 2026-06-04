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

const allowedTipeKonversi = [
  'Konversi 20 SKS',
  'Tidak Konversi',
  'Konversi 2 SKS',
];

function parseKuota(value: unknown) {
  const kuota = Number(value);

  if (!Number.isInteger(kuota) || kuota < 1) {
    return null;
  }

  return kuota;
}

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user || user.role !== 'Super Admin') {
      return forbiddenResponse(
        'Akses ditolak. Hanya Super Admin yang dapat melihat pengajuan lowongan.'
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

    const body = await request.json();

    const nama_mitra = trimString(body.nama_mitra);
    const alamat_mitra = optionalTrimString(body.alamat_mitra);
    const website_mitra = optionalTrimString(body.website_mitra);

    const nama_pic = trimString(body.nama_pic);
    const kontak_pic = trimString(body.kontak_pic);
    const email_pic = optionalTrimString(body.email_pic);

    const posisi = trimString(body.posisi);
    const deskripsi = trimString(body.deskripsi);
    const persyaratan = optionalTrimString(body.persyaratan);
    const lokasi = optionalTrimString(body.lokasi);

    const sistem_kerja = body.sistem_kerja || 'Onsite';
    const tipe_konversi = body.tipe_konversi || 'Konversi 20 SKS';
    const kuota = parseKuota(body.kuota || 1);
    const link_pendaftaran = optionalTrimString(body.link_pendaftaran);

    if (
      !nama_mitra ||
      !nama_pic ||
      !kontak_pic ||
      !posisi ||
      !deskripsi
    ) {
      return badRequestResponse(
        'Nama mitra, nama PIC, kontak PIC, posisi, dan deskripsi lowongan wajib diisi.'
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

    if (!allowedTipeKonversi.includes(tipe_konversi)) {
      return badRequestResponse('Tipe konversi tidak valid.');
    }

    if (!kuota) {
      return badRequestResponse('Kuota harus berupa angka minimal 1.');
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
      tipe_konversi,
      kuota,
      link_pendaftaran,

      status: 'Menunggu',
      catatan_super_admin: null,
    });

    return successResponse(
      pengajuan,
      'Pengajuan lowongan berhasil dikirim. Tim akan memverifikasi data lowongan terlebih dahulu.',
      201
    );
  } catch (error) {
    console.error('CREATE_PENGAJUAN_LOWONGAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user || user.role !== 'Super Admin') {
      return forbiddenResponse(
        'Akses ditolak. Hanya Super Admin yang dapat memverifikasi pengajuan lowongan.'
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
        'Catatan Super Admin wajib diisi jika pengajuan lowongan ditolak.'
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