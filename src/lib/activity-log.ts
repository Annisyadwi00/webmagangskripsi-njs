import ActivityLog, { ActivityLogAction } from '@/models/ActivityLog';

type Actor = {
  id?: number;
  name?: string;
  role?: string;
} | null;

type CreateActivityLogPayload = {
  actor: Actor;
  action: ActivityLogAction;
  description: string;
  target_id?: number | null;
  target_type?: string | null;
};

export async function createActivityLog({
  actor,
  action,
  description,
  target_id = null,
  target_type = null,
}: CreateActivityLogPayload) {
  try {
    await ActivityLog.create({
      user_id: actor?.id || null,
      name: actor?.name || null,
      role: actor?.role || null,
      action,
      description,
      target_id,
      target_type,
    });
  } catch (error) {
    console.error('CREATE_ACTIVITY_LOG_ERROR:', error);
  }
}