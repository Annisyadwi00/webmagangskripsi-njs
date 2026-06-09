import { NextResponse } from 'next/server';
import PengajuanMitra, {
  PengajuanMitraStatus,
} from '@/models/PengajuanMitra';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';

const allowedStatus: PengajuanMitraStatus[] = [
  'Menunggu',
  'Disetujui',
  'Ditolak',
];

const allowedSistemKerja = ['Onsite', 'Hybrid', 'Remote'];

function trimString(value: unknown) {
  return String(value || '').trim();
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
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak.',
        },
        { status: 401 }
      );
    }

    if (isStaffRole(user.role)) {
      const data = await PengajuanMitra.findAll({
        order: [['createdAt', 'DESC']],
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Data pengajuan mitra berhasil diambil.',
          data,
        },
        { status: 200 }
      );
    }

    if (user.role === 'Mahasiswa') {
      const data = await PengajuanMitra.findAll({
        where: {
          user_id: user.id,
        },
        order: [['createdAt', 'DESC']],
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Data pengajuan mitra berhasil diambil.',
          data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Role tidak memiliki akses.',
      },
      { status: 403 }
    );
  } catch (error) {
    console.error('GET_PENGAJUAN_MITRA_ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak. Silakan login terlebih dahulu.',
        },
        { status: 401 }
      );
    }

    if (user.role !== 'Mahasiswa') {
      return NextResponse.json(
        {
          success: false,
          message: 'Hanya mahasiswa yang dapat mengajukan mitra.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const nama_mitra = trimString(body.nama_mitra);
    const alamat_kantor_mitra = trimString(body.alamat_kantor_mitra);
    const url_mitra = trimString(body.url_mitra) || null;

    const nama_narahubung_mitra = trimString(body.nama_narahubung_mitra);
    const kontak_narahubung_mitra = trimString(body.kontak_narahubung_mitra);
    const email_pic = trimString(body.email_pic) || null;

    const lokasi = trimString(body.lokasi) || null;
    const sistem_kerja = trimString(body.sistem_kerja) || null;
    const kuota = Number(body.kuota);
    const link_pendaftaran = trimString(body.link_pendaftaran) || null;
    const deskripsi_lowongan = trimString(body.deskripsi_lowongan) || null;
    const persyaratan = trimString(body.persyaratan) || null;

    const link_akta_pendirian =
      trimString(body.link_akta_pendirian) || null;
    const link_akta_direksi = trimString(body.link_akta_direksi) || null;
    const link_ktp_penandatangan =
      trimString(body.link_ktp_penandatangan) || null;
    const link_npwp = trimString(body.link_npwp) || null;
    const link_izin_usaha = trimString(body.link_izin_usaha) || null;

    const nama_mahasiswa_pengusul =
      trimString(body.nama_mahasiswa_pengusul) || user.name;
    const npm_mahasiswa_pengusul = trimString(body.npm_mahasiswa_pengusul);
    const program_studi_mahasiswa = trimString(body.program_studi_mahasiswa);
    const angkatan_mahasiswa = trimString(body.angkatan_mahasiswa);
    const kontak_mahasiswa = trimString(body.kontak_mahasiswa);
    const kelas = trimString(body.kelas);

    if (
      !nama_mitra ||
      !alamat_kantor_mitra ||
      !nama_narahubung_mitra ||
      !kontak_narahubung_mitra ||
      !email_pic ||
      !lokasi ||
      !sistem_kerja ||
      !deskripsi_lowongan ||
      !persyaratan ||
      !nama_mahasiswa_pengusul ||
      !npm_mahasiswa_pengusul ||
      !program_studi_mahasiswa ||
      !angkatan_mahasiswa ||
      !kontak_mahasiswa ||
      !kelas
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Data mitra, narahubung, detail lowongan, data mahasiswa, kontak mahasiswa, dan kelas wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (!allowedSistemKerja.includes(sistem_kerja)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sistem kerja tidak valid.',
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(kuota) || kuota < 1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kuota harus berupa angka minimal 1.',
        },
        { status: 400 }
      );
    }

    if (url_mitra && !isValidUrl(url_mitra)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Format URL mitra tidak valid.',
        },
        { status: 400 }
      );
    }

    if (link_pendaftaran && !isValidUrl(link_pendaftaran)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Format link pendaftaran tidak valid.',
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email_pic)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Format email narahubung tidak valid.',
        },
        { status: 400 }
      );
    }

    if (!isValidPhone(kontak_narahubung_mitra)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nomor kontak narahubung mitra harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
        },
        { status: 400 }
      );
    }

    if (!isValidPhone(kontak_mahasiswa)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nomor kontak mahasiswa harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
        },
        { status: 400 }
      );
    }

    const documentLinks = [
      ['Akta pendirian', link_akta_pendirian],
      ['Akta susunan direksi', link_akta_direksi],
      ['KTP penandatangan', link_ktp_penandatangan],
      ['NPWP perusahaan', link_npwp],
      ['Izin usaha terkait', link_izin_usaha],
    ] as const;

    for (const [label, link] of documentLinks) {
      if (link && !isValidUrl(link)) {
        return NextResponse.json(
          {
            success: false,
            message: `Format link ${label.toLowerCase()} tidak valid.`,
          },
          { status: 400 }
        );
      }
    }

    const newPengajuanMitra = await PengajuanMitra.create({
      user_id: user.id,

      nama_mitra,
      alamat_kantor_mitra,
      url_mitra,
      nama_narahubung_mitra,
      kontak_narahubung_mitra,
      email_pic,

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

      status: 'Menunggu',
      catatan_admin: null,
    });

    await createActivityLog({
      actor: user,
      action: 'CREATE_PENGAJUAN_MITRA',
      description: `${user.name} mengajukan mitra ${nama_mitra}.`,
      target_id: newPengajuanMitra.getDataValue('id'),
      target_type: 'PengajuanMitra',
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Pengajuan mitra berhasil dikirim dan akan diperiksa oleh staff.',
        data: newPengajuanMitra,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE_PENGAJUAN_MITRA_ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak.',
        },
        { status: 401 }
      );
    }

    if (!isStaffRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Hanya staff yang dapat memverifikasi pengajuan mitra.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const status = body.status as PengajuanMitraStatus;
    const catatan_admin = trimString(body.catatan_admin) || null;

    if (!id || Number.isNaN(id) || !status) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID pengajuan dan status wajib dikirim.',
        },
        { status: 400 }
      );
    }

    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Status pengajuan mitra tidak valid.',
        },
        { status: 400 }
      );
    }

    if (status === 'Ditolak' && !catatan_admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Catatan staff wajib diisi jika pengajuan ditolak.',
        },
        { status: 400 }
      );
    }

    const pengajuanMitra = await PengajuanMitra.findByPk(id);

    if (!pengajuanMitra) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pengajuan mitra tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    await pengajuanMitra.update({
      status,
      catatan_admin,
    });

    await createActivityLog({
      actor: user,
      action: 'VERIFIKASI_PENGAJUAN_MITRA',
      description: `${user.name} mengubah status pengajuan mitra ${pengajuanMitra.getDataValue(
        'nama_mitra'
      )} menjadi ${status}.`,
      target_id: pengajuanMitra.getDataValue('id'),
      target_type: 'PengajuanMitra',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Status pengajuan mitra berhasil diperbarui.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_MITRA_ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server.',
      },
      { status: 500 }
    );
  }
}