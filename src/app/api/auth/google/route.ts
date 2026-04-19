import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Ganti string kosong dengan Client ID dari Google Cloud Console kamu nantinya
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "CLIENT_ID_KAMU_DISINI.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    
    // 1. Verifikasi keaslian token dari Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Gagal membaca data dari Google");

    const email = payload.email;

    // 2. Validasi Email Kampus (Biar email gmail biasa gak bisa masuk)
    if (!email.endsWith('unsika.ac.id')) {
      return NextResponse.json({ message: 'Harap gunakan email institusi resmi (@...unsika.ac.id)' }, { status: 403 });
    }

    // 3. Cek apakah email tersebut SUDAH DAFTAR di database kita
    await connectDB();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Akun belum terdaftar! Silakan lakukan Registrasi dulu.' }, { status: 404 });
    }

    // 4. Kalau cocok, buatkan Token JWT kita sendiri (Sama kayak login biasa)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/'
    });

    return NextResponse.json({ message: 'Login via Google Berhasil!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}