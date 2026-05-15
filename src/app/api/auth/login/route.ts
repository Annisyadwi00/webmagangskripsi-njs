import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { isValidEmail, trimString } from '@/lib/validators';
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
} from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const email = trimString(body.email);
    const password = trimString(body.password);

    if (!email || !password) {
      return badRequestResponse('Email dan password wajib diisi.');
    }

    if (!isValidEmail(email)) {
      return badRequestResponse('Format email tidak valid.');
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return unauthorizedResponse('Email atau password salah.');
    }

    const isMatch = await bcrypt.compare(
      password,
      user.getDataValue('password')
    );

    if (!isMatch) {
      return unauthorizedResponse('Email atau password salah.');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET belum dikonfigurasi.');
    }

    const token = jwt.sign(
      {
        id: user.getDataValue('id'),
        role: user.getDataValue('role'),
        name: user.getDataValue('name'),
        prodi: user.getDataValue('prodi'),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    const cookieStore = await cookies();

    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return successResponse(
      {
        role: user.getDataValue('role'),
        name: user.getDataValue('name'),
        prodi: user.getDataValue('prodi'),
      },
      'Login berhasil.'
    );
  } catch (error) {
    console.error('LOGIN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}