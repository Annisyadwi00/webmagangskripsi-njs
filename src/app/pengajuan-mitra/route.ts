import { NextResponse } from 'next/server';
import PengajuanMitra, {
  PengajuanMitraStatus,
} from '@/models/PengajuanMitra';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';

function trimString(value: unknown) {
  return String(value || '').trim();
}

function isValidUrl(value: string) {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidPhone(value: string) {
  return /^62\d{8,15}$/.test(value);
}

const allowedStatus: PengajuanMitraStatus[] = [
  'Menunggu',
  'Disetujui',
  'Ditolak',
];

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: 'Akses ditolak.' },
        { status: 401 }
      );
    }

    if (user.role === 'Admin') {
      const data = await PengajuanMitra.findAll({
        order: [['createdAt', 'DESC']],
      });

      return NextResponse.json(
        {
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
          message: 'Data pengajuan mitra berhasil diambil.',
          data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Role tidak memiliki akses.' },
      { status: 403 }
    );
  } catch (error) {
    console.error('GET_PENGAJUAN_MITRA_ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
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
        { message: 'Akses ditolak.' },
        { status: 401 }
      );
    }

    if (user.role !== 'Mahasiswa') {
      return NextResponse.json(
        { message: 'Hanya mahasiswa yang dapat mengajukan mitra.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const nama_mitra = trimString(body.nama_mitra);
    const alamat_kantor_mitra = trimString(body.alamat_kantor_mitra);
    const url_mitra = trimString(body.url_mitra) || null;
    const nama_narahubung_mitra = trimString(body.nama_narahubung_mitra);
    const kontak_narahubung_mitra = trimString(body.kontak_narahubung_mitra);

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
      !nama_mahasiswa_pengusul ||
      !npm_mahasiswa_pengusul ||
      !program_studi_mahasiswa ||
      !angkatan_mahasiswa ||
      !kontak_mahasiswa ||
      !kelas
    ) {
      return NextResponse.json(
        {
          message:
            'Nama mitra, alamat, narahubung, kontak mitra, data mahasiswa, kontak mahasiswa, dan kelas wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (url_mitra && !isValidUrl(url_mitra)) {
      return NextResponse.json(
        { message: 'Format URL mitra tidak valid.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(kontak_narahubung_mitra)) {
      return NextResponse.json(
        {
          message:
            'Nomor kontak narahubung mitra harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
        },
        { status: 400 }
      );
    }

    if (!isValidPhone(kontak_mahasiswa)) {
      return NextResponse.json(
        {
          message:
            'Nomor kontak mahasiswa harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
        },
        { status: 400 }
      );
    }

    const newPengajuanMitra = await PengajuanMitra.create({
      user_id: user.id,

      nama_mitra,
      alamat_kantor_mitra,
      url_mitra,
      nama_narahubung_mitra,
      kontak_narahubung_mitra,

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
        message: 'Pengajuan mitra berhasil dikirim.',
        data: newPengajuanMitra,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE_PENGAJUAN_MITRA_ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
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
        { message: 'Akses ditolak.' },
        { status: 401 }
      );
    }

    if (user.role !== 'Admin') {
      return NextResponse.json(
        { message: 'Hanya admin yang dapat memverifikasi pengajuan mitra.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = body.id;
    const status = body.status as PengajuanMitraStatus;
    const catatan_admin = trimString(body.catatan_admin) || null;

    if (!id || !status) {
      return NextResponse.json(
        { message: 'ID pengajuan dan status wajib dikirim.' },
        { status: 400 }
      );
    }

    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { message: 'Status pengajuan mitra tidak valid.' },
        { status: 400 }
      );
    }

    if (status === 'Ditolak' && !catatan_admin) {
      return NextResponse.json(
        { message: 'Catatan admin wajib diisi jika pengajuan ditolak.' },
        { status: 400 }
      );
    }

    const pengajuanMitra = await PengajuanMitra.findByPk(id);

    if (!pengajuanMitra) {
      return NextResponse.json(
        { message: 'Pengajuan mitra tidak ditemukan.' },
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
      { message: 'Status pengajuan mitra berhasil diperbarui.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_MITRA_ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}