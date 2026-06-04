import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export type AuthUser = {
  id: number;
  role: string;
  name: string;
  prodi?: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET belum dikonfigurasi.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'Admin') {
    return null;
  }

  return user;
}


export async function requireSuperAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'Super Admin') {
    return null;
  }

  return user;
}

export async function requireAdminOrSuperAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
    return null;
  }

  return user;
}

export async function requireDosen(): Promise<AuthUser | null> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'Dosen') {
    return null;
  }

  return user;
}

export async function requireMahasiswa(): Promise<AuthUser | null> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'Mahasiswa') {
    return null;
  }

  return user;
}

