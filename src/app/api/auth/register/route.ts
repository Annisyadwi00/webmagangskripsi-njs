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

    const name = trimString(body.name);
    const email = trimString(body.email);
    const password = trimString(body.password);
    const nim_nidn = trimString(body.nim_nidn);
    const prodi = trimString(body.prodi) || 'S1 Informatika';

    if (!name || !email || !password || !nim_nidn) {
      return badRequestResponse(
        'Nama, email, password, dan NIM wajib diisi.'
      );
    }

    if (!isValidEmail(email)) {
      return badRequestResponse('Format email tidak valid.');
    }

    if (password.length < 8) {
      return badRequestResponse('Password minimal 8 karakter.');
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return badRequestResponse('Email sudah terdaftar.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Mahasiswa',
      nim_nidn,
      prodi,
    });

    return messageResponse('Registrasi berhasil.', 201);
  } catch (error) {
    console.error('REGISTER_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}