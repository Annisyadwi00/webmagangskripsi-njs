
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
    
    return successResponse({ items: [] }); // Placeholder return
  } catch (error: any) {
    return errorResponse(error.message);
  }
}