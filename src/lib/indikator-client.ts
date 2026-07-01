import { apiClient } from '@/lib/api-client';

export type IndikatorPenilaianItem = {
  id: number;
  tipe: 'dospem' | 'penguji' | 'mitra' | string;
  kode: string;
  label: string;
  bobot: number;
  urutan: number;
  aktif: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function getIndikatorList(tipe?: string, aktifOnly: boolean = false): Promise<IndikatorPenilaianItem[]> {
  const params = new URLSearchParams();
  if (tipe) params.set('tipe', tipe);
  if (aktifOnly) params.set('aktifOnly', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';

  const response = await apiClient<IndikatorPenilaianItem[]>(`/api/indikator-penilaian${query}`);
  return response.data || [];
}

export async function createIndikator(payload: {
  tipe: string;
  label: string;
  bobot?: number;
  urutan?: number;
  kode?: string;
}): Promise<IndikatorPenilaianItem> {
  const response = await apiClient<IndikatorPenilaianItem>('/api/indikator-penilaian', {
    method: 'POST',
    body: payload,
  });
  if (!response.data) throw new Error('No data returned');
  return response.data;
}

export async function updateIndikator(
  id: number,
  payload: Partial<{
    label: string;
    bobot: number;
    urutan: number;
    aktif: boolean;
    kode: string;
  }>
): Promise<IndikatorPenilaianItem> {
  const response = await apiClient<IndikatorPenilaianItem>(`/api/indikator-penilaian/${id}`, {
    method: 'PUT',
    body: payload,
  });
  if (!response.data) throw new Error('No data returned');
  return response.data;
}

export async function deleteIndikator(id: number): Promise<void> {
  await apiClient<null>(`/api/indikator-penilaian/${id}`, {
    method: 'DELETE',
  });
}
