import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await connectDB();
    // Tambahkan 'prodi' di baris ini
    const { name, email, password, role, nim_nidn, prodi } = await request.json();

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar!' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Mahasiswa',
      nim_nidn,
      prodi: prodi || 'S1 Informatika' // <--- Simpan ke database
    });

    return NextResponse.json({ message: 'Registrasi berhasil!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}