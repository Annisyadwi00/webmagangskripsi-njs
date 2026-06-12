import { NextRequest, NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import User from '@/models/User';
import { normalizeNpm } from '@/lib/npm-helper';
import { findMahasiswaSiskaByNpm } from '@/lib/siska-client';

export async function POST(req: NextRequest) {
  try {
    await sequelize.authenticate();

    const body = await req.json();
    const npm = normalizeNpm(body.npm);

    if (!npm) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM wajib diisi.',
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      where: {
        nim_nidn: npm,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM ini sudah pernah digunakan untuk registrasi.',
        },
        { status: 409 }
      );
    }

    const mahasiswa = await findMahasiswaSiskaByNpm(npm);

    return NextResponse.json({
      success: true,
      message: 'NPM valid.',
      data: mahasiswa,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat mengecek NPM.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}