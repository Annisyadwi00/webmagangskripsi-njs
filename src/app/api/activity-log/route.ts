import ActivityLog from '@/models/ActivityLog';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== 'Admin') {
      return forbiddenResponse('Hanya admin yang dapat mengakses activity log.');
    }

    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    return successResponse(logs, 'Activity log berhasil diambil.');
  } catch (error) {
    console.error('GET_ACTIVITY_LOG_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}