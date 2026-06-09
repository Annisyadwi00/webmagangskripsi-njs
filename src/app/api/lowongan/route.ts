import Job, { JobStatus, JobTipeKonversi, JobType } from '@/models/Job';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  isValidEmail,
  isValidUrl,
  optionalTrimString,
  trimString,
} from '@/lib/validators';
import {
  successResponse,
  messageResponse,
  errorResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

const allowedJobTypes: JobType[] = ['Onsite', 'Hybrid', 'Remote'];
const allowedTipeKonversi: JobTipeKonversi[] = [
  'Konversi 20 SKS',
  'Tidak Konversi',
  'Magang 2 SKS Khusus SI',
];
const allowedStatus: JobStatus[] = ['Aktif', 'Nonaktif'];

function parseKuota(value: unknown) {
  const kuota = Number(value);

  if (!Number.isInteger(kuota) || kuota < 1) {
    return null;
  }

  return kuota;
}

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const jobs = await Job.findAll({
      where: showAll ? undefined : { status: 'Aktif' },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(jobs, 'Data lowongan berhasil diambil.');
  } catch (error) {
    console.error('GET_LOWONGAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

async function requireStaff() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'Super Admin' && user.role !== 'Admin')) {
    return null;
  }

  return user;
}

export async function POST(request: Request) {
  try {
    await connectDB();    

   const staff = await requireStaff();

if (!staff) {
  return forbiddenResponse(
    'Akses ditolak. Hanya staff yang dapat membuat lowongan.'
  );
}

    const body = await request.json();

    const title = trimString(body.posisi);
    const company = trimString(body.perusahaan);
    const description = trimString(body.deskripsi);
    const location = trimString(body.location) || 'Menyesuaikan';
    const kategori = trimString(body.kategori) || 'Umum';
    const type = body.type as JobType;
    const tipeKonversi = body.tipeKonversi as JobTipeKonversi;
    const kuota = parseKuota(body.kuota || 1);
    const link_pendaftaran = optionalTrimString(body.link_pendaftaran);
    const email_perusahaan = optionalTrimString(body.email_perusahaan);
    const valid_until = body.valid_until || null;
    const isPaid = body.isPaid === true || body.isPaid === 'Ya';

    if (!title || !company || !description) {
      return badRequestResponse('Posisi, perusahaan, dan deskripsi wajib diisi.');
    }

    if (!allowedJobTypes.includes(type)) {
      return badRequestResponse('Tipe kerja tidak valid.');
    }

    if (!allowedTipeKonversi.includes(tipeKonversi)) {
      return badRequestResponse('Tipe konversi tidak valid.');
    }

    if (!kuota) {
      return badRequestResponse('Kuota harus berupa angka minimal 1.');
    }

    if (link_pendaftaran && !isValidUrl(link_pendaftaran)) {
      return badRequestResponse('Format link pendaftaran tidak valid.');
    }

    if (email_perusahaan && !isValidEmail(email_perusahaan)) {
      return badRequestResponse('Format email perusahaan tidak valid.');
    }

    const newJob = await Job.create({
      title,
      company,
      description,
      location,
      kategori,
      type,
      tipeKonversi,
      isPaid,
      kuota,
      link_pendaftaran,
      email_perusahaan,
      valid_until,
      status: 'Aktif',
    });

    return successResponse(
      newJob,
      'Lowongan berhasil dibuat.',
      201
    );
  } catch (error) {
    console.error('CREATE_LOWONGAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

  const staff = await requireStaff();

if (!staff) {
  return forbiddenResponse(
    'Akses ditolak. Hanya staff yang dapat mengubah lowongan.'
  );
}

    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return badRequestResponse('ID lowongan dan aksi wajib dikirim.');
    }

    const job = await Job.findByPk(id);

    if (!job) {
      return notFoundResponse('Lowongan tidak ditemukan.');
    }

    if (action === 'activate') {
      await job.update({
        status: 'Aktif',
      });

      return messageResponse('Lowongan berhasil diaktifkan.');
    }

    if (action === 'deactivate') {
      await job.update({
        status: 'Nonaktif',
      });

      return messageResponse('Lowongan berhasil dinonaktifkan.');
    }

    if (action === 'delete') {
      await job.destroy();

      return messageResponse('Lowongan berhasil dihapus.');
    }

    if (action === 'edit') {
      const title = trimString(body.posisi);
      const company = trimString(body.perusahaan);
      const description = trimString(body.deskripsi);
      const location = trimString(body.location) || 'Menyesuaikan';
      const kategori = trimString(body.kategori) || 'Umum';
      const type = body.type as JobType;
      const tipeKonversi = body.tipeKonversi as JobTipeKonversi;
      const kuota = parseKuota(body.kuota || 1);
      const link_pendaftaran = optionalTrimString(body.link_pendaftaran);
      const email_perusahaan = optionalTrimString(body.email_perusahaan);
      const valid_until = body.valid_until || null;
      const isPaid = body.isPaid === true || body.isPaid === 'Ya';
      const status = body.status as JobStatus | undefined;

      if (!title || !company || !description) {
        return badRequestResponse(
          'Posisi, perusahaan, dan deskripsi wajib diisi.'
        );
      }

      if (!allowedJobTypes.includes(type)) {
        return badRequestResponse('Tipe kerja tidak valid.');
      }

      if (!allowedTipeKonversi.includes(tipeKonversi)) {
        return badRequestResponse('Tipe konversi tidak valid.');
      }

      if (!kuota) {
        return badRequestResponse('Kuota harus berupa angka minimal 1.');
      }

      if (status && !allowedStatus.includes(status)) {
        return badRequestResponse('Status lowongan tidak valid.');
      }

      if (link_pendaftaran && !isValidUrl(link_pendaftaran)) {
        return badRequestResponse('Format link pendaftaran tidak valid.');
      }

      if (email_perusahaan && !isValidEmail(email_perusahaan)) {
        return badRequestResponse('Format email perusahaan tidak valid.');
      }

      await job.update({
        title,
        company,
        description,
        location,
        kategori,
        type,
        tipeKonversi,
        isPaid,
        kuota,
        link_pendaftaran,
        email_perusahaan,
        valid_until,
        status: status || job.getDataValue('status'),
      });

      return messageResponse('Lowongan berhasil diperbarui.');
    }

    return badRequestResponse('Aksi tidak valid.');
  } catch (error) {
    console.error('UPDATE_LOWONGAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}