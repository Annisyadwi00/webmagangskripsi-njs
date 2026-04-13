import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Pastikan koneksi database berjalan
    await connectDB();

    // 2. Ambil data dari body request (dari form frontend)
    const body = await request.json();
    const { name, identifier, email, phone, password, role } = body;

    // 3. Validasi sederhana
    if (!name || !identifier || !email || !password || !role) {
      return NextResponse.json({ message: 'Semua kolom wajib diisi!' }, { status: 400 });
    }

    // 4. Cek apakah email atau NIM/NIDN sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar!' }, { status: 409 });
    }

    // 5. Enkripsi password menggunakan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Simpan user baru ke database MySQL
    const newUser = await User.create({
      name,
      identifier,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    // 7. Kembalikan respons sukses
    return NextResponse.json(
      { 
        message: 'Registrasi berhasil!', 
        user: { id: newUser.id, name: newUser.name, role: newUser.role } 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}