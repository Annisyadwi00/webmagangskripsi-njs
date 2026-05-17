import Logbook, { LogbookStatus } from '@/models/Logbook';
import Pengajuan from '@/models/Pengajuan';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createActivityLog } from '@/lib/activity-log';
import { isValidUrl, trimString } from '@/lib/validators';
import {
  successResponse,
  messageResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

const allowedLogbookStatus: LogbookStatus[] = [
  'Menunggu',
  'Disetujui',
  'Revisi',
];

type DateInput = string | Date | null | undefined;

function isValidDate(value: DateInput) {
  if (!value) return false;

  const date = value instanceof Date ? value : new Date(value);

  return !Number.isNaN(date.getTime());
}

function normalizeDate(value: DateInput) {
  if (!value) return null;

  const date =
    value instanceof Date
      ? new Date(value)
      : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

function isDateBetween(target: DateInput, start: DateInput, end: DateInput) {
  const targetDate = normalizeDate(target);
  const startDate = normalizeDate(start);
  const endDate = normalizeDate(end);

  if (!targetDate || !startDate || !endDate) {
    return false;
  }

  return targetDate >= startDate && targetDate <= endDate;
}

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role === 'Admin') {
      const data = await Logbook.findAll({
        order: [['tanggal', 'DESC']],
      });

      return successResponse(data, 'Data logbook berhasil diambil.');
    }

    if (user.role === 'Dosen') {
      const pengajuanBimbingan = await Pengajuan.findAll({
        where: {
          dosenId: user.id,
        },
        attributes: ['id'],
      });

      const pengajuanIds = pengajuanBimbingan.map((item) =>
        item.getDataValue('id')
      );

      const data = await Logbook.findAll({
        where: {
          pengajuan_id: pengajuanIds,
        },
        order: [['tanggal', 'DESC']],
      });

      return successResponse(data, 'Data logbook bimbingan berhasil diambil.');
    }

    if (user.role === 'Mahasiswa') {
      const data = await Logbook.findAll({
        where: {
          user_id: user.id,
        },
        order: [['tanggal', 'DESC']],
      });

      return successResponse(data, 'Data logbook berhasil diambil.');
    }

    return forbiddenResponse('Role tidak valid.');
  } catch (error) {
    console.error('GET_LOGBOOK_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== 'Mahasiswa') {
      return forbiddenResponse('Hanya mahasiswa yang dapat membuat logbook.');
    }

    const body = await request.json();

    const pengajuan_id = body.pengajuan_id;
    const tanggal = body.tanggal;
    const kegiatan = trimString(body.kegiatan);
    const jam_mulai = body.jam_mulai;
    const jam_selesai = body.jam_selesai;
    const bukti_kegiatan = trimString(body.bukti_kegiatan) || null;

    if (!pengajuan_id || !tanggal || !kegiatan || !jam_mulai || !jam_selesai) {
      return badRequestResponse(
        'Pengajuan, tanggal, kegiatan, jam mulai, dan jam selesai wajib diisi.'
      );
    }

    if (!isValidDate(tanggal)) {
      return badRequestResponse('Format tanggal logbook tidak valid.');
    }

    if (kegiatan.length < 10) {
      return badRequestResponse('Kegiatan minimal 10 karakter.');
    }

    if (bukti_kegiatan && !isValidUrl(bukti_kegiatan)) {
      return badRequestResponse('Format link bukti kegiatan tidak valid.');
    }

    if (jam_mulai >= jam_selesai) {
      return badRequestResponse('Jam mulai harus lebih awal dari jam selesai.');
    }

    const pengajuan = await Pengajuan.findOne({
      where: {
        id: pengajuan_id,
        user_id: user.id,
        status: 'Aktif',
      },
    });

    if (!pengajuan) {
      return notFoundResponse('Pengajuan aktif tidak ditemukan.');
    }

    const tglMulai = pengajuan.getDataValue('tgl_mulai');
    const tglBerakhir = pengajuan.getDataValue('tgl_berakhir');

    if (!isDateBetween(tanggal, tglMulai, tglBerakhir)) {
      return badRequestResponse(
        'Tanggal logbook harus berada dalam periode magang.'
      );
    }

    const newLogbook = await Logbook.create({
      user_id: user.id,
      pengajuan_id,
      tanggal,
      kegiatan,
      jam_mulai,
      jam_selesai,
      bukti_kegiatan,
      status: 'Menunggu',
    });

    await createActivityLog({
      actor: user,
      action: 'CREATE_LOGBOOK',
      description: `${user.name} membuat logbook tanggal ${tanggal}.`,
      target_id: newLogbook.getDataValue('id'),
      target_type: 'Logbook',
    });

    return successResponse(newLogbook, 'Logbook berhasil disimpan!', 201);
  } catch (error) {
    console.error('CREATE_LOGBOOK_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const action = body.action;

    if (!action) {
      return badRequestResponse('Aksi wajib dikirim.');
    }

    if (user.role === 'Dosen' && action === 'evaluasi') {
      const logbook_id = body.logbook_id;
      const status = body.status as LogbookStatus;
      const komentar_dosen = trimString(body.komentar_dosen) || null;

      if (!logbook_id || !status) {
        return badRequestResponse('ID logbook dan status wajib dikirim.');
      }

      if (!allowedLogbookStatus.includes(status)) {
        return badRequestResponse('Status logbook tidak valid.');
      }

      if (status === 'Revisi' && !komentar_dosen) {
        return badRequestResponse(
          'Komentar dosen wajib diisi jika status Revisi.'
        );
      }

      const logbook = await Logbook.findByPk(logbook_id);

      if (!logbook) {
        return notFoundResponse('Logbook tidak ditemukan.');
      }

      const pengajuan = await Pengajuan.findOne({
        where: {
          id: logbook.getDataValue('pengajuan_id'),
          dosenId: user.id,
        },
      });

      if (!pengajuan) {
        return forbiddenResponse(
          'Anda tidak memiliki akses untuk mengevaluasi logbook ini.'
        );
      }

      await logbook.update({
        status,
        komentar_dosen,
      });

      await createActivityLog({
        actor: user,
        action: 'EVALUASI_LOGBOOK',
        description: `${user.name} mengevaluasi logbook mahasiswa ${pengajuan.getDataValue(
          'nama_mahasiswa'
        )} dengan status ${status}.`,
        target_id: logbook.getDataValue('id'),
        target_type: 'Logbook',
      });

      return messageResponse('Evaluasi logbook berhasil disimpan!');
    }

    if (user.role === 'Mahasiswa' && action === 'update') {
      const logbook_id = body.logbook_id;
      const kegiatan = trimString(body.kegiatan);
      const jam_mulai = body.jam_mulai;
      const jam_selesai = body.jam_selesai;
      const bukti_kegiatan = trimString(body.bukti_kegiatan) || null;

      if (!logbook_id || !kegiatan || !jam_mulai || !jam_selesai) {
        return badRequestResponse(
          'ID logbook, kegiatan, jam mulai, dan jam selesai wajib diisi.'
        );
      }

      if (kegiatan.length < 10) {
        return badRequestResponse('Kegiatan minimal 10 karakter.');
      }

      if (bukti_kegiatan && !isValidUrl(bukti_kegiatan)) {
        return badRequestResponse('Format link bukti kegiatan tidak valid.');
      }

      if (jam_mulai >= jam_selesai) {
        return badRequestResponse(
          'Jam mulai harus lebih awal dari jam selesai.'
        );
      }

      const logbook = await Logbook.findOne({
        where: {
          id: logbook_id,
          user_id: user.id,
        },
      });

      if (!logbook) {
        return notFoundResponse('Logbook tidak ditemukan.');
      }

      const pengajuan = await Pengajuan.findOne({
        where: {
          id: logbook.getDataValue('pengajuan_id'),
          user_id: user.id,
          status: 'Aktif',
        },
      });

      if (!pengajuan) {
        return notFoundResponse('Pengajuan aktif tidak ditemukan.');
      }

      const tanggalLogbook = logbook.getDataValue('tanggal');
      const tglMulai = pengajuan.getDataValue('tgl_mulai');
      const tglBerakhir = pengajuan.getDataValue('tgl_berakhir');

      if (!isDateBetween(tanggalLogbook, tglMulai, tglBerakhir)) {
        return badRequestResponse(
          'Tanggal logbook harus berada dalam periode magang.'
        );
      }

      await logbook.update({
        kegiatan,
        jam_mulai,
        jam_selesai,
        bukti_kegiatan,
        status: 'Menunggu',
        komentar_dosen: null,
      });

      await createActivityLog({
        actor: user,
        action: 'UPDATE_LOGBOOK',
        description: `${user.name} memperbarui logbook dan mengirim ulang untuk evaluasi.`,
        target_id: logbook.getDataValue('id'),
        target_type: 'Logbook',
      });

      return messageResponse('Logbook berhasil diperbarui!');
    }

    return badRequestResponse('Aksi tidak valid.');
  } catch (error) {
    console.error('UPDATE_LOGBOOK_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}