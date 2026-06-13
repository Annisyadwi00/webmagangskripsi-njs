import { NextResponse } from 'next/server';

type RawMahasiswa = Record<string, unknown>;

function isRecord(value: unknown): value is RawMahasiswa {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(data: RawMahasiswa, keys: string[]) {
  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return '';
}

function normalizeMahasiswa(data: RawMahasiswa) {
  return {
    npm: getString(data, ['npm', 'nim', 'NPM', 'NIM']),
    nama: getString(data, ['nama', 'name', 'nama_mahasiswa', 'Nama']),
    email: getString(data, ['email', 'email_kampus', 'Email']),
    prodi: getString(data, ['prodi', 'program_studi', 'jurusan', 'Program Studi']),
    angkatan: getString(data, ['angkatan', 'tahun_masuk', 'Angkatan']),
    semester: getString(data, ['semester', 'Semester']),
    kelas: getString(data, ['kelas', 'Kelas']),
    no_hp: getString(data, ['no_hp', 'phone', 'nomor_hp', 'wa', 'whatsapp']),
  };
}

function getRawMahasiswaData(result: unknown) {
  if (Array.isArray(result)) {
    return isRecord(result[0]) ? result[0] : null;
  }

  if (!isRecord(result)) {
    return null;
  }

  const data = result.data;

  if (Array.isArray(data)) {
    return isRecord(data[0]) ? data[0] : null;
  }

  if (isRecord(data)) {
    return data;
  }

  return result;
}

function buildApiUrl(apiUrl: string, npm: string) {
  if (apiUrl.includes('{npm}')) {
    return apiUrl.replace('{npm}', encodeURIComponent(npm));
  }

  return `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}npm=${encodeURIComponent(npm)}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const npm = searchParams.get('npm')?.trim();

    if (!npm) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM/NIM wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]+$/.test(npm)) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM/NIM hanya boleh berisi angka.',
        },
        { status: 400 }
      );
    }

    const apiUrl = process.env.KAMPUS_MAHASISWA_API_URL;
    const apiToken = process.env.KAMPUS_API_TOKEN;

    if (!apiUrl || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Konfigurasi API kampus belum lengkap. Cek KAMPUS_MAHASISWA_API_URL dan KAMPUS_API_TOKEN.',
        },
        { status: 500 }
      );
    }

    const response = await fetch(buildApiUrl(apiUrl, npm), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal mengambil data mahasiswa dari API kampus.',
          data: result,
        },
        { status: response.status }
      );
    }

    const rawData = getRawMahasiswaData(result);

    if (!rawData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data mahasiswa tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    const mahasiswa = normalizeMahasiswa(rawData);

    if (!mahasiswa.npm && !mahasiswa.nama) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Data mahasiswa berhasil diterima, tapi format response API kampus belum sesuai mapping.',
          data: result,
        },
        { status: 422 }
      );
    }

    if (mahasiswa.npm && mahasiswa.npm !== npm) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM/NIM tidak sesuai dengan data mahasiswa kampus.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data mahasiswa berhasil ditemukan.',
      data: mahasiswa,
    });
  } catch (error) {
    console.error('REGISTER_CHECK_NPM_ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat mengecek data mahasiswa.',
      },
      { status: 500 }
    );
  }
}