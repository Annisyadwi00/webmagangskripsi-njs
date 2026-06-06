import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  messageResponse,
  errorResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

function trimString(value: unknown) {
  return String(value || '').trim();
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return forbiddenResponse('Akses ditolak.');
    }

    const body = await request.json();
    const phone = trimString(body.phone);

    if (!phone) {
      return badRequestResponse('Nomor WhatsApp wajib diisi.');
    }

    if (!/^62\d{8,15}$/.test(phone)) {
      return badRequestResponse(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
    }

    const user = await User.findByPk(currentUser.id);

    if (!user) {
      return notFoundResponse('Data pengguna tidak ditemukan.');
    }

    await user.update({
      phone,
    });

    return messageResponse('Nomor WhatsApp berhasil diperbarui.');
  } catch (error) {
    console.error('UPDATE_CURRENT_USER_PROFILE_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}