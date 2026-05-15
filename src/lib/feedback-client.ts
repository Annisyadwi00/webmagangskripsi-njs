import { apiClient } from '@/lib/api-client';

export type FeedbackStatus = 'Unread' | 'Read';

export type Feedback = {
  id: number;
  nama: string;
  email: string;
  pesan: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};

export async function getFeedbackList() {
  const result = await apiClient<Feedback[]>('/api/feedback');

  if (!result.data) {
    throw new Error('Data feedback tidak ditemukan.');
  }

  return result.data;
}

export async function createFeedback(payload: {
  nama: string;
  email: string;
  pesan: string;
}) {
  return apiClient<null>('/api/feedback', {
    method: 'POST',
    body: payload,
  });
}

export async function markFeedbackAsRead(id: number) {
  return apiClient<null>('/api/feedback', {
    method: 'PUT',
    body: {
      id,
    },
  });
}

export async function deleteFeedback(id: number) {
  return apiClient<null>('/api/feedback', {
    method: 'PUT',
    body: {
      id,
      action: 'delete',
    },
  });
}