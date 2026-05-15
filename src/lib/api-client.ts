export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: HeadersInit;
};

export async function apiClient<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers } = options;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const result = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(result.message || 'Terjadi kesalahan request.');
  }

  return result;
}