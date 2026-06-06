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

const allowedRoles: UserRole[] = ['Admin', 'Super Admin'];

function generateDefaultPassword() {
  return `SImagang${new Date().getFullYear()}`;
}

export async function GET() {
  try {
    await connectDB();

    const superAdmin = await requireSuperAdmin();

if (!superAdmin) {
  return forbiddenResponse(
    'Akses ditolak. Hanya staff yang dapat melihat data pengguna.'
  );
}

    const users = await User.findAll({
  where: {
    role: ['Admin', 'Super Admin'],
  },
  attributes: { exclude: ['password'] },
  order: [['createdAt', 'DESC']],
});

    return successResponse(
      users,
      'Data pengguna berhasil diambil.'
    );
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
    'Akses ditolak. Hanya staff yang dapat mengubah pengguna.'
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
    const kategori_dosen = optionalTrimString(body.kategori_dosen);

    if (!name || !email || !role) {
      return badRequestResponse('Nama, email, dan role wajib diisi.');
    }

    if (!isValidEmail(email)) {
      return badRequestResponse('Format email tidak valid.');
    }

    if (!allowedRoles.includes(role)) {
      return badRequestResponse('Role tidak valid.');
    }

    if (password && password.length < 8) {
      return badRequestResponse('Password minimal 8 karakter.');
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
  prodi: null,
  semester: null,
  kategori_dosen: null,
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
    'Akses ditolak. Hanya staff yang dapat menambahkan pengguna.'
  );
}

    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return badRequestResponse('ID pengguna dan aksi wajib dikirim.');
    }

    const user = await User.findByPk(id);

    
    if (!user) {
      return notFoundResponse('Pengguna tidak ditemukan.');
    }

    if (
  user.getDataValue('role') !== 'Admin' &&
  user.getDataValue('role') !== 'Super Admin'
) {
  return forbiddenResponse(
    'User management hanya dapat mengelola akun Admin dan staff.'
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