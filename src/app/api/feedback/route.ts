import Feedback from '@/models/Feedback';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { isValidEmail, trimString } from '@/lib/validators';
import {
  successResponse,
  messageResponse,
  errorResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();

    const admin = await requireAdmin();

    if (!admin) {
      return forbiddenResponse(
        'Akses ditolak. Hanya Admin yang dapat melihat feedback.'
      );
    }

    const messages = await Feedback.findAll({
      order: [['createdAt', 'DESC']],
    });

    return successResponse(
      messages,
      'Data feedback berhasil diambil.'
    );
  } catch (error) {
    console.error('GET_FEEDBACK_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const nama = trimString(body.nama);
    const email = trimString(body.email);
    const pesan = trimString(body.pesan);

    if (!nama || !email || !pesan) {
      return badRequestResponse('Nama, email, dan pesan wajib diisi.');
    }

    if (!isValidEmail(email)) {
      return badRequestResponse('Format email tidak valid.');
    }

    if (pesan.length < 10) {
      return badRequestResponse('Pesan minimal 10 karakter.');
    }

    if (pesan.length > 1000) {
      return badRequestResponse('Pesan maksimal 1000 karakter.');
    }

    await Feedback.create({
      nama,
      email,
      pesan,
    });

    return messageResponse('Pesan terkirim!', 201);
  } catch (error) {
    console.error('CREATE_FEEDBACK_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const admin = await requireAdmin();

    if (!admin) {
      return forbiddenResponse(
        'Akses ditolak. Hanya Admin yang dapat mengubah feedback.'
      );
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return badRequestResponse('ID feedback wajib dikirim.');
    }

    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return notFoundResponse('Feedback tidak ditemukan.');
    }

    if (action === 'delete') {
      await feedback.destroy();

      return messageResponse('Pesan berhasil dihapus.');
    }

    await feedback.update({
      status: 'Read',
    });

    return messageResponse('Pesan ditandai sudah dibaca.');
  } catch (error) {
    console.error('UPDATE_FEEDBACK_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}