import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();

    const email = 'superadmin@unsika.ac.id';
    const password = 'SImagang2026';

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      await existingUser.update({
        name: 'Super Admin SI Magang',
        password: hashedPassword,
        role: 'Super Admin',
        nim_nidn: 'SUPERADMIN001',
        prodi: 'Fakultas Ilmu Komputer',
        phone: '6281234567890',
      });

      return NextResponse.json({
        message: 'Akun Super Admin sudah ada dan berhasil diperbarui.',
        email,
        password,
      });
    }

    await User.create({
      name: 'Super Admin SI Magang',
      email,
      password: hashedPassword,
      role: 'Super Admin',
      nim_nidn: 'SUPERADMIN001',
      prodi: 'Fakultas Ilmu Komputer',
      phone: '6281234567890',
    });

    return NextResponse.json({
      message: 'Akun Super Admin berhasil dibuat.',
      email,
      password,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan server.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}