// src/app/api/kampus/mahasiswa/[npm]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ npm: string }> }
) {
  try {
    const { npm } = await params;

    const API_URL = process.env.SISKA_MAHASISWA_API_URL;
    const TOKEN = process.env.SISKA_API_TOKEN;

    if (!API_URL || !TOKEN) {
      console.error('Missing env: SISKA_MAHASISWA_API_URL or SISKA_API_TOKEN');
      return NextResponse.json(
        { error: 'Konfigurasi server tidak lengkap.' },
        { status: 500 }
      );
    }

    const url = `${API_URL}/${encodeURIComponent(npm)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    // Forward status code dan data apa adanya
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Internal API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data mahasiswa.' },
      { status: 500 }
    );
  }
}