import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MahasiswaSiska from '@/models/MahasiswaSiska';
import User from '@/models/User';
import {
  getAngkatanFromNpm,
  getProdiFromNpm,
  isAllowedMahasiswaNpm,
  normalizeNpm,
} from '@/lib/npm-helper';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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

    if (!isAllowedMahasiswaNpm(npm)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'NPM tidak valid. Hanya mahasiswa angkatan 2022, 2023, 2024 dari prodi Teknik Informatika atau Sistem Informasi yang dapat register.',
        },
        { status: 400 }
      );
    }

    const mahasiswa = await MahasiswaSiska.findOne({
      where: { npm },
    });

    if (!mahasiswa) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM tidak ditemukan pada data mahasiswa Siska.',
        },
        { status: 404 }
      );
    }

    if (mahasiswa.is_registered) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM ini sudah pernah digunakan untuk registrasi.',
        },
        { status: 409 }
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
          message: 'Akun dengan NPM ini sudah terdaftar.',
        },
        { status: 409 }
      );
    }

    const angkatan = mahasiswa.angkatan || getAngkatanFromNpm(npm);
    const prodi = mahasiswa.prodi || getProdiFromNpm(npm);

    return NextResponse.json({
      success: true,
      message: 'NPM valid.',
      data: {
        npm: mahasiswa.npm,
        nama: mahasiswa.nama,
        email: mahasiswa.email,
        angkatan,
        prodi,
        kelas: mahasiswa.kelas || '',
      },
    });
  } catch (error) {
    console.error('CHECK NPM ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat mengecek NPM.',
      },
      { status: 500 }
    );
  }
}