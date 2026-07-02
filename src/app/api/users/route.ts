import bcrypt from 'bcryptjs';
import User, { UserRole } from '@/models/User';
import { connectDB } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';
import { isValidEmail, trimString, optionalTrimString } from '@/lib/validators';
import {
  successResponse,
  messageResponse,
  errorResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

const allowedRoles: UserRole[] = ['Admin', 'Super Admin', 'Dosen'];

function generateDefaultPassword() {
  return `Hikari${new Date().getFullYear()}`;
}

function parseKuota(value: unknown) {
  const kuota = Number(value);

  if (!Number.isInteger(kuota) || kuota < 0) {
    return 5;
  }

  return kuota;
}

export async function GET() {
  try {
    await connectDB();

   

  

    const users = await User.findAll({
      where: {
        role: ['Admin', 'Super Admin', 'Dosen'],
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(users, 'Data pengguna berhasil diambil.');
  } catch (error) {
    console.error('GET_USERS_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const superAdmin = await requireSuperAdmin();

    if (!superAdmin) {
      return forbiddenResponse(
        'Akses ditolak. Hanya Super Admin yang dapat menambahkan pengguna.'
      );
    }

    const body = await request.json();

    const name = trimString(body.name);
    const email = trimString(body.email);
    const password = optionalTrimString(body.password);
    const role = body.role as UserRole;

    const nim_nidn = trimString(body.nim_nidn) || '-';
    const prodi = optionalTrimString(body.prodi);
    const semester = optionalTrimString(body.semester);
    const angkatan = optionalTrimString(body.angkatan);
    const kelas = optionalTrimString(body.kelas);
    const kategori_dosen = optionalTrimString(body.kategori_dosen);
    const kuota_bimbingan = parseKuota(body.kuota_bimbingan);
    const phone = optionalTrimString(body.phone);

    if (!name || !email || !role) {
      return badRequestResponse('Nama, email, dan role wajib diisi.');
    }

    if (!isValidEmail(email)) {
      return badRequestResponse('Format email tidak valid.');
    }

    if (!allowedRoles.includes(role)) {
      return badRequestResponse(
        'Role tidak valid. User management hanya mengelola Admin, Super Admin, dan Dosen.'
      );
    }

    if (password && password.length < 8) {
      return badRequestResponse('Password minimal 8 karakter.');
    }

    if (phone && !/^62\d{8,15}$/.test(phone)) {
      return badRequestResponse(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return badRequestResponse('Email sudah terdaftar.');
    }

    const finalPassword = password || generateDefaultPassword();
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      nim_nidn,
      prodi,
      semester,
      angkatan,
      kelas,
      kategori_dosen,
      kuota_bimbingan,
      phone,
      photo: null,
    });

    return successResponse(
      {
        defaultPassword: password ? null : finalPassword,
      },
      'Pengguna berhasil ditambahkan.',
      201
    );
  } catch (error) {
    console.error('CREATE_USER_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const superAdmin = await requireSuperAdmin();

    if (!superAdmin) {
      return forbiddenResponse(
        'Akses ditolak. Hanya Super Admin yang dapat mengubah pengguna.'
      );
    }

    const body = await request.json();
    const id = Number(body.id);
    const action = trimString(body.action);

    if (!id || Number.isNaN(id) || !action) {
      return badRequestResponse('ID pengguna dan aksi wajib dikirim.');
    }

    const user = await User.findByPk(id);

    if (!user) {
      return notFoundResponse('Pengguna tidak ditemukan.');
    }

    if (
      user.getDataValue('role') !== 'Admin' &&
      user.getDataValue('role') !== 'Super Admin' &&
      user.getDataValue('role') !== 'Dosen'
    ) {
      return forbiddenResponse(
        'User management hanya dapat mengelola akun Admin, Super Admin, dan Dosen.'
      );
    }

    if (action === 'delete') {
      await user.destroy();

      return messageResponse('Pengguna berhasil dihapus.');
    }

    if (action === 'reset_password') {
      const defaultPassword = generateDefaultPassword();
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await user.update({
        password: hashedPassword,
      });

      return successResponse(
        {
          defaultPassword,
        },
        'Password berhasil direset.'
      );
    }

    return badRequestResponse('Aksi tidak valid.');
  } catch (error) {
    console.error('UPDATE_USER_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}