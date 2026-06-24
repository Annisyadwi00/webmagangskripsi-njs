// lib/mitra-client.ts
import { apiClient, ApiResponse } from '@/lib/api-client';

export type MitraStatus = 'Aktif' | 'Nonaktif' | 'Menunggu' | 'Disetujui';

export type Mitra = {
  id: number;
  nama_mitra: string;
  alamat_kantor_mitra: string | null;
  url_mitra: string | null;
  email_perusahaan: string | null;
  kontak_narahubung_mitra: string | null;
  nama_narahubung_mitra: string | null;
  status: MitraStatus;
  catatan_admin?: string | null;
  createdAt: string;
  updatedAt: string;
  latitude?: number | null;
  longitude?: number | null;
  logo?: string | null;
  deskripsi?: string | null;
};

function normalizeMitraData(data: unknown): Mitra[] {
  if (!data) return [];
  let items: any[] = [];
  if (Array.isArray(data)) items = data;
  else if (typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    items = (data as any).data;
  }
  
  return items.map(item => ({
    ...item,
    alamat_kantor_mitra: item.alamat_kantor_mitra || item.alamat || null,
    url_mitra: item.url_mitra || item.website || null,
    email_perusahaan: item.email_perusahaan || item.email || null,
    kontak_narahubung_mitra: item.kontak_narahubung_mitra || item.kontak_wa || null,
  })) as Mitra[];
}

export async function getMitraList(limit?: number): Promise<Mitra[]> {
  const query = limit ? `?limit=${limit}` : '';
  const response = await apiClient<Mitra[] | { data: Mitra[] }>(`/api/mitra${query}`);
  // response adalah ApiResponse, kita ambil response.data
  return normalizeMitraData(response.data);
}

export async function getAllMitraList(): Promise<Mitra[]> {
  const response = await apiClient<Mitra[] | { data: Mitra[] }>('/api/mitra?all=true');
  return normalizeMitraData(response.data);
}

export async function createMitra(payload: {
  nama_mitra: string;
  alamat_kantor_mitra?: string | null;
  url_mitra?: string | null;
  email_perusahaan?: string | null;
  kontak_narahubung_mitra?: string | null;
  nama_narahubung_mitra?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  logo?: string | null;
  deskripsi?: string | null;
}): Promise<Mitra> {
  const response = await apiClient<Mitra>('/api/mitra', {
    method: 'POST',
    body: payload,
  });
  if (!response.data) throw new Error('No data returned');
  return response.data;
}

export async function updateMitra(payload: {
  id: number;
  nama_mitra?: string;
  alamat_kantor_mitra?: string | null;
  url_mitra?: string | null;
  email_perusahaan?: string | null;
  kontak_narahubung_mitra?: string | null;
  nama_narahubung_mitra?: string | null;
  status?: MitraStatus;
  latitude?: number | null;
  longitude?: number | null;
  logo?: string | null;
  deskripsi?: string | null;
}): Promise<{ message: string }> {
  const response = await apiClient<null>('/api/mitra', {
    method: 'PUT',
    body: {
      action: 'edit',
      ...payload,
    },
  });
  return { message: response.message };
}

export async function activateMitra(id: number): Promise<{ message: string }> {
  const response = await apiClient<null>('/api/mitra', {
    method: 'PUT',
    body: {
      id,
      action: 'activate',
    },
  });
  return { message: response.message };
}

export async function deactivateMitra(id: number): Promise<{ message: string }> {
  const response = await apiClient<null>('/api/mitra', {
    method: 'PUT',
    body: {
      id,
      action: 'deactivate',
    },
  });
  return { message: response.message };
}