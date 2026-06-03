import { NextResponse } from 'next/server';
import PengajuanDokumen, {
  JenisDokumen,
  PengajuanDokumenStatus,
} from '@/models/PengajuanDokumen';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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

const allowedJenisDokumen: JenisDokumen[] = [
  'Surat Permohonan Magang',
  'SK Dosen Pembimbing',
  'Surat Perpanjangan Magang',
  'Surat Keterangan Selesai Magang',
  'Implementation of Arrangement',
  'Laporan Pelaksanaan Kerja Sama',
  'Dokumen Nilai Akhir',
  'Lainnya',
];

const allowedStatus: PengajuanDokumenStatus[] = [
  'Menunggu',
  'Diproses',
  'Selesai',
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
      const data = await PengajuanDokumen.findAll({
        order: [['createdAt', 'DESC']],
      });

      return NextResponse.json(
        {
          message: 'Data pengajuan dokumen berhasil diambil.',
          data,
        },
        { status: 200 }
      );
    }

    if (user.role === 'Mahasiswa') {
      const data = await PengajuanDokumen.findAll({
        where: {
          user_id: user.id,
        },
        order: [['createdAt', 'DESC']],
      });

      return NextResponse.json(
        {
          message: 'Data pengajuan dokumen berhasil diambil.',
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
    console.error('GET_PENGAJUAN_DOKUMEN_ERROR:', error);

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
        { message: 'Hanya mahasiswa yang dapat mengajukan dokumen.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const nama_mahasiswa = trimString(body.nama_mahasiswa) || user.name;
    const npm = trimString(body.npm);
    const program_studi = trimString(body.program_studi);
    const kelas = trimString(body.kelas);

    const jenis_dokumen = trimString(body.jenis_dokumen) as JenisDokumen;
    const keperluan = trimString(body.keperluan);
    const catatan_mahasiswa = trimString(body.catatan_mahasiswa) || null;

    if (
      !nama_mahasiswa ||
      !npm ||
      !program_studi ||
      !kelas ||
      !jenis_dokumen ||
      !keperluan
    ) {
      return NextResponse.json(
        {
          message:
            'Nama mahasiswa, NPM, program studi, kelas, jenis dokumen, dan keperluan wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (!allowedJenisDokumen.includes(jenis_dokumen)) {
      return NextResponse.json(
        { message: 'Jenis dokumen tidak valid.' },
        { status: 400 }
      );
    }

    const newPengajuanDokumen = await PengajuanDokumen.create({
      user_id: user.id,

      nama_mahasiswa,
      npm,
      program_studi,
      kelas,

      jenis_dokumen,
      keperluan,
      catatan_mahasiswa,

      status: 'Menunggu',
      catatan_admin: null,
      link_dokumen: null,
    });

    return NextResponse.json(
      {
        message: 'Pengajuan dokumen berhasil dikirim.',
        data: newPengajuanDokumen,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE_PENGAJUAN_DOKUMEN_ERROR:', error);

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
        { message: 'Hanya admin yang dapat memproses pengajuan dokumen.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const status = trimString(body.status) as PengajuanDokumenStatus;
    const catatan_admin = trimString(body.catatan_admin) || null;
    const link_dokumen = trimString(body.link_dokumen) || null;

    if (!id || Number.isNaN(id) || !status) {
      return NextResponse.json(
        { message: 'ID dan status pengajuan wajib dikirim.' },
        { status: 400 }
      );
    }

    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { message: 'Status pengajuan dokumen tidak valid.' },
        { status: 400 }
      );
    }

    if (status === 'Selesai' && !link_dokumen) {
      return NextResponse.json(
        {
          message:
            'Link dokumen wajib diisi jika status pengajuan sudah selesai.',
        },
        { status: 400 }
      );
    }

    if (status === 'Ditolak' && !catatan_admin) {
      return NextResponse.json(
        { message: 'Catatan admin wajib diisi jika pengajuan ditolak.' },
        { status: 400 }
      );
    }

    if (link_dokumen && !isValidUrl(link_dokumen)) {
      return NextResponse.json(
        { message: 'Format link dokumen tidak valid.' },
        { status: 400 }
      );
    }

    const pengajuanDokumen = await PengajuanDokumen.findByPk(id);

    if (!pengajuanDokumen) {
      return NextResponse.json(
        { message: 'Pengajuan dokumen tidak ditemukan.' },
        { status: 404 }
      );
    }

    await pengajuanDokumen.update({
      status,
      catatan_admin,
      link_dokumen,
    });

    return NextResponse.json(
      { message: 'Status pengajuan dokumen berhasil diperbarui.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_DOKUMEN_ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}