import { NextResponse } from 'next/server';
import Mitra from '@/models/Mitra';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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

function isValidPhone(value: string | null) {
  if (!value) return true;

  return /^62\d{8,15}$/.test(value);
}

async function requireStaff() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
    return null;
  }

  return user;
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || undefined;
    const all = searchParams.get('all') === 'true';

    const user = await getCurrentUser();

    const canSeeAll =
      all && user && (user.role === 'Admin' || user.role === 'Super Admin');

    const data = await Mitra.findAll({
      where: canSeeAll ? undefined : { status: 'Aktif' },
      order: [['nama_mitra', 'ASC']],
      limit,
    });

    return NextResponse.json({
      message: 'Data mitra berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('GET_MITRA_ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const staff = await requireStaff();

    if (!staff) {
      return NextResponse.json(
        { message: 'Akses ditolak. Hanya staff yang dapat menambah mitra.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const nama_mitra = trimString(body.nama_mitra);
    const logo = trimString(body.logo) || null;
    const alamat = trimString(body.alamat) || null;
    const kontak_wa = trimString(body.kontak_wa) || null;
    const email = trimString(body.email) || null;
    const website = trimString(body.website) || null;
    const deskripsi = trimString(body.deskripsi) || null;

    if (!nama_mitra) {
      return NextResponse.json(
        { message: 'Nama mitra wajib diisi.' },
        { status: 400 }
      );
    }

    if (!isValidUrl(logo)) {
      return NextResponse.json(
        { message: 'Format URL logo tidak valid.' },
        { status: 400 }
      );
    }

    if (!isValidUrl(website)) {
      return NextResponse.json(
        { message: 'Format website tidak valid.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(kontak_wa)) {
      return NextResponse.json(
        {
          message:
            'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
        },
        { status: 400 }
      );
    }

    const mitra = await Mitra.create({
      nama_mitra,
      logo,
      alamat,
      kontak_wa,
      email,
      website,
      deskripsi,
      status: 'Aktif',
    });

    return NextResponse.json(
      {
        message: 'Mitra berhasil ditambahkan.',
        data: mitra,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE_MITRA_ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const staff = await requireStaff();

    if (!staff) {
      return NextResponse.json(
        { message: 'Akses ditolak. Hanya staff yang dapat mengubah mitra.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const action = trimString(body.action);

    if (!id || Number.isNaN(id) || !action) {
      return NextResponse.json(
        { message: 'ID mitra dan aksi wajib dikirim.' },
        { status: 400 }
      );
    }

    const mitra = await Mitra.findByPk(id);

    if (!mitra) {
      return NextResponse.json(
        { message: 'Mitra tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (action === 'activate') {
      await mitra.update({ status: 'Aktif' });

      return NextResponse.json({
        message: 'Mitra berhasil diaktifkan.',
      });
    }

    if (action === 'deactivate') {
      await mitra.update({ status: 'Nonaktif' });

      return NextResponse.json({
        message: 'Mitra berhasil dinonaktifkan.',
      });
    }

    if (action === 'edit') {
      const nama_mitra = trimString(body.nama_mitra);
      const logo = trimString(body.logo) || null;
      const alamat = trimString(body.alamat) || null;
      const kontak_wa = trimString(body.kontak_wa) || null;
      const email = trimString(body.email) || null;
      const website = trimString(body.website) || null;
      const deskripsi = trimString(body.deskripsi) || null;
      const status = trimString(body.status) as 'Aktif' | 'Nonaktif';

      if (!nama_mitra) {
        return NextResponse.json(
          { message: 'Nama mitra wajib diisi.' },
          { status: 400 }
        );
      }

      if (status && !['Aktif', 'Nonaktif'].includes(status)) {
        return NextResponse.json(
          { message: 'Status mitra tidak valid.' },
          { status: 400 }
        );
      }

      if (!isValidUrl(logo)) {
        return NextResponse.json(
          { message: 'Format URL logo tidak valid.' },
          { status: 400 }
        );
      }

      if (!isValidUrl(website)) {
        return NextResponse.json(
          { message: 'Format website tidak valid.' },
          { status: 400 }
        );
      }

      if (!isValidEmail(email)) {
        return NextResponse.json(
          { message: 'Format email tidak valid.' },
          { status: 400 }
        );
      }

      if (!isValidPhone(kontak_wa)) {
        return NextResponse.json(
          {
            message:
              'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
          },
          { status: 400 }
        );
      }

      await mitra.update({
        nama_mitra,
        logo,
        alamat,
        kontak_wa,
        email,
        website,
        deskripsi,
        status: status || mitra.getDataValue('status'),
      });

      return NextResponse.json({
        message: 'Mitra berhasil diperbarui.',
      });
    }

    return NextResponse.json(
      { message: 'Aksi tidak valid.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('UPDATE_MITRA_ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}