import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { isValidEmail, trimString } from '@/lib/validators';
import {
  messageResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const email = trimString(body.email);
    const password = trimString(body.password);
    const nim_nidn = trimString(body.nim_nidn);
    const phone = trimString(body.phone);

    if (!email || !password || !nim_nidn || !phone) {
      return badRequestResponse(
        'NPM/NIM, email kampus, nomor WhatsApp, dan password wajib diisi.'
      );
    }

    if (!/^[0-9]+$/.test(nim_nidn)) {
      return badRequestResponse('NPM/NIM hanya boleh berisi angka.');
    }

    if (!/^62\d{8,15}$/.test(phone)) {
      return badRequestResponse(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
    }

    if (!isValidEmail(email)) {
      return badRequestResponse('Format email tidak valid.');
    }

    if (!email.endsWith('unsika.ac.id')) {
      return badRequestResponse(
        'Registrasi wajib menggunakan email kampus UNSIKA.'
      );
    }

    if (password.length < 8) {
      return badRequestResponse('Password minimal 8 karakter.');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[^+"{]+$/;

    if (!passwordRegex.test(password)) {
      return badRequestResponse(
        'Password harus mengandung minimal 1 huruf kapital dan 1 angka.'
      );
    }

    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      return badRequestResponse('Email sudah terdaftar.');
    }

    const existingNim = await User.findOne({
      where: { nim_nidn },
    });

    if (existingNim) {
      return badRequestResponse('NPM/NIM sudah terdaftar.');
    }

    /**
     * Catatan:
     * Untuk sementara nama dan prodi dibuat default dulu.
     * Nanti saat token API kampus sudah tersedia,
     * bagian ini diganti dengan hasil validasi API kampus.
     */
    const name = `Mahasiswa ${nim_nidn}`;
    const prodi = 'Belum Terverifikasi';

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Mahasiswa',
      nim_nidn,
      prodi,
      semester: null,
      phone,
      photo: null,
    });

    return messageResponse(
      'Registrasi berhasil. Data identitas mahasiswa akan divalidasi melalui data akademik kampus.',
      201
    );
  } catch (error) {
    console.error('REGISTER_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}