import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Di form UI kita, inputnya bernama "email", tapi user bisa isi Email atau NIM
    const { email: identifierInput, password } = body; 

    if (!identifierInput || !password) {
      return NextResponse.json({ message: 'Email/NIM dan password wajib diisi!' }, { status: 400 });
    }

    // 1. Cari user di database berdasarkan Email ATAU Identifier (NIM/NIDN)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifierInput },
          { identifier: identifierInput }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Akun tidak ditemukan!' }, { status: 404 });
    }

    // 2. Cek apakah password yang dimasukkan cocok dengan yang di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Password salah!' }, { status: 401 });
    }

    // 3. Buat JWT Token (Kunci Akses)
    const secretKey = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        name: user.name 
      }, 
      secretKey, 
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    // 4. Buat response sukses dan simpan token di Cookies browser
    const response = NextResponse.json(
      { message: 'Login berhasil!', role: user.role },
      { status: 200 }
    );

    // UBAH CARA PENULISAN COOKIESNYA MENJADI SEPERTI INI:
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari dalam detik
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}