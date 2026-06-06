import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isValidUrl, optionalTrimString, trimString } from '@/lib/validators';
import {
  successResponse,
  messageResponse,
  errorResponse,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Akses ditolak. Silakan login kembali.');
    }

    const user = await User.findByPk(currentUser.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return notFoundResponse('User tidak ditemukan.');
    }

    return successResponse(user, 'Data profil berhasil diambil.');
  } catch (error) {
    console.error('GET_ME_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Akses ditolak. Silakan login kembali.');
    }

    const body = await request.json();
    const action = body.action;

    if (!action) {
      return badRequestResponse('Aksi wajib dikirim.');
    }

    const user = await User.findByPk(currentUser.id);

    if (!user) {
      return notFoundResponse('User tidak ditemukan.');
    }

    if (action === 'update_profile') {
  const phone = optionalTrimString(body.phone);

  if (!phone) {
    return badRequestResponse('Nomor WhatsApp wajib diisi.');
  }

  if (!/^62\d{8,15}$/.test(phone)) {
    return badRequestResponse(
      'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
    );
  }

  await user.update({
    phone,
  });

  return messageResponse('Nomor WhatsApp berhasil diperbarui.');
}

    if (action === 'update_password') {
      const currentPassword = trimString(body.currentPassword);
      const newPassword = trimString(body.newPassword);
      const confirmPassword = trimString(body.confirmPassword);

      if (!currentPassword || !newPassword || !confirmPassword) {
        return badRequestResponse(
          'Password lama, password baru, dan konfirmasi password wajib diisi.'
        );
      }

      if (newPassword.length < 8) {
        return badRequestResponse('Password baru minimal 8 karakter.');
      }

      if (newPassword !== confirmPassword) {
        return badRequestResponse('Konfirmasi password tidak sesuai.');
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        user.getDataValue('password')
      );

      if (!isMatch) {
        return badRequestResponse('Kata sandi saat ini salah.');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await user.update({
        password: hashedNewPassword,
      });

      return messageResponse('Kata sandi berhasil diubah.');
    }

    return badRequestResponse('Aksi tidak valid.');
  } catch (error) {
    console.error('UPDATE_ME_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}