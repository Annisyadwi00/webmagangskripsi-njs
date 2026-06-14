import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { isValidEmail, trimString } from '@/lib/validators';
import {
  messageResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-response';

type KampusMahasiswaRaw = Record<string, unknown>;

type KampusMahasiswa = {
  npm: string;
  nama: string;
  email: string;
  prodi: string;
  angkatan: string;
  semester: string;
  kelas: string;
  no_hp: string;
};

class KampusApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status = 500, data?: unknown) {
    super(message);
    this.name = 'KampusApiError';
    this.status = status;
    this.data = data;
  }
}

function isRecord(value: unknown): value is KampusMahasiswaRaw {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(data: KampusMahasiswaRaw, keys: string[]) {
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

function normalizeMahasiswa(data: KampusMahasiswaRaw): KampusMahasiswa {
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

function buildKampusUrl(apiUrl: string, npm: string) {
  if (apiUrl.includes('{npm}')) {
    return apiUrl.replace('{npm}', encodeURIComponent(npm));
  }

  return `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}npm=${encodeURIComponent(npm)}`;
}

async function getMahasiswaKampusByNpm(npm: string) {
  const apiUrl = process.env.SISKA_MAHASISWA_API_URL;
  const apiToken = process.env.SISKA_API_TOKEN;

  if (!apiUrl || !apiToken) {
    throw new KampusApiError(
      'Konfigurasi API kampus belum lengkap. Cek KAMPUS_MAHASISWA_API_URL dan KAMPUS_API_TOKEN.',
      500
    );
  }

  const response = await fetch(buildKampusUrl(apiUrl, npm), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new KampusApiError(
      'Gagal mengambil data mahasiswa dari API kampus.',
      response.status,
      result
    );
  }

  const rawData = getRawMahasiswaData(result);

  if (!rawData) {
    throw new KampusApiError('Data mahasiswa tidak ditemukan.', 404);
  }

  const mahasiswa = normalizeMahasiswa(rawData);

  if (!mahasiswa.npm && !mahasiswa.nama) {
    throw new KampusApiError(
      'Data mahasiswa berhasil diterima, tetapi format response API kampus belum sesuai mapping.',
      422,
      result
    );
  }

  return mahasiswa;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const email = trimString(body.email).toLowerCase();
    const password = trimString(body.password);
    const nim_nidn = trimString(body.nim_nidn);
    const phone = trimString(body.phone);
    const name = trimString(body.name);

    if (!email || !password || !nim_nidn || !phone) {
      return badRequestResponse(
        'NPM/NIM, email kampus, nomor WhatsApp, dan password wajib diisi.'
      );
    }

    if (!name) {
      return badRequestResponse('Nama lengkap wajib diisi.');
    }

    if (!/^[0-9]+$/.test(nim_nidn)) {
      return badRequestResponse('NPM/NIM hanya boleh berisi angka.');
    }

    if (!/^62\d{8,15}$/.test(phone)) {
      return badRequestResponse(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
    }

    if (!isValidEmail(email)) {
      return badRequestResponse('Format email tidak valid.');
    }

    if (!email.endsWith('unsika.ac.id')) {
      return badRequestResponse(
        'Registrasi wajib menggunakan email kampus UNSIKA.'
      );
    }

    if (password.length < 8) {
      return badRequestResponse('Password minimal 8 karakter.');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[^+"{]+$/;

    if (!passwordRegex.test(password)) {
      return badRequestResponse(
        'Password harus mengandung minimal 1 huruf kapital dan 1 angka.'
      );
    }

    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      return badRequestResponse('Email sudah terdaftar.');
    }

    const existingNim = await User.findOne({
      where: { nim_nidn },
    });

    if (existingNim) {
      return badRequestResponse('NPM/NIM sudah terdaftar.');
    }

    let mahasiswa: KampusMahasiswa;

    try {
      mahasiswa = await getMahasiswaKampusByNpm(nim_nidn);
    } catch (error) {
      if (error instanceof KampusApiError) {
        return errorResponse(error.message, error.status);
      }

      throw error;
    }

    if (mahasiswa.npm && mahasiswa.npm !== nim_nidn) {
      return badRequestResponse(
        'NPM/NIM tidak sesuai dengan data mahasiswa dari API kampus.'
      );
    }

    if (mahasiswa.email && mahasiswa.email.toLowerCase() !== email) {
      return badRequestResponse(
        'Email kampus tidak sesuai dengan data akademik mahasiswa.'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const finalName = mahasiswa.nama || name || `Mahasiswa ${nim_nidn}`;

    await User.create({
      name: finalName,
      email,
      password: hashedPassword,
      role: 'Mahasiswa',
      nim_nidn,
      prodi: mahasiswa.prodi || null,
      semester: mahasiswa.semester || null,
      angkatan: mahasiswa.angkatan || null,
      kelas: mahasiswa.kelas || null,
      phone,
      photo: null,
    });

    return messageResponse(
      'Registrasi berhasil. Akun mahasiswa berhasil dibuat berdasarkan data akademik kampus.',
      201
    );
  } catch (error) {
    console.error('REGISTER_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}