import { NextResponse } from 'next/server';

export function successResponse<T>(
  data: T,
  message = 'Berhasil.',
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function messageResponse(message: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export function unauthorizedResponse(message = 'Akses ditolak. Silakan login kembali.') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Anda tidak memiliki akses.') {
  return errorResponse(message, 403);
}

export function badRequestResponse(message = 'Request tidak valid.') {
  return errorResponse(message, 400);
}

export function notFoundResponse(message = 'Data tidak ditemukan.') {
  return errorResponse(message, 404);
}