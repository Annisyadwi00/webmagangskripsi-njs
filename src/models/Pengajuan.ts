import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type PengajuanStatus =
  | 'Menunggu_Verifikasi'
  | 'Aktif'
  | 'Ditolak'
  | 'Selesai';

export type StatusDosen = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type PengajuanAttributes = {
  id: number;
  user_id: number;

  nama_mahasiswa: string;
  npm: string | null;
  program_studi: string | null;
  angkatan: string | null;
  semester: string | null;
  kelas: string | null;

  jenis_magang: string | null;
  no_hp_mahasiswa: string | null;
  foto_diri: string | null;
  bukti_penerimaan: string | null;

  perusahaan: string;
  posisi: string;
  link_loa: string | null;

  alamat_tempat_magang: string | null;
  nama_penanggung_jawab: string | null;
  kontak_penanggung_jawab: string | null;
  latitude: string | null;
  longitude: string | null;
  rencana_magang: string | null;

  tipeKonversi: string | null;
  tgl_mulai: Date | string | null;
  tgl_berakhir: Date | string | null;
  matkulKonversi: string | null;
  semester_konversi: string | null;

  link_laporan_akhir: string | null;
  link_output_magang: string | null;

  nilai_dari_dosen: string | null;
  nilai_kedisiplinan: number | null;
  nilai_materi: number | null;
  nilai_koding: number | null;
  nilai_laporan: number | null;
  nilai_mitra: number | null;

  dosenId: number | null;
  nama_dosen: string | null;
  status_dosen: StatusDosen | null;

  dosenPengujiId: number | null;
  nama_dosen_penguji: string | null;

  status: PengajuanStatus;
  alasan_penolakan: string | null;

  createdAt?: Date;
  updatedAt?: Date;
};

export type PengajuanCreationAttributes = Optional<
  PengajuanAttributes,
  | 'id'
  | 'npm'
  | 'program_studi'
  | 'angkatan'
  | 'semester'
  | 'kelas'
  | 'jenis_magang'
  | 'no_hp_mahasiswa'
  | 'foto_diri'
  | 'bukti_penerimaan'
  | 'link_loa'
  | 'alamat_tempat_magang'
  | 'nama_penanggung_jawab'
  | 'kontak_penanggung_jawab'
  | 'latitude'
  | 'longitude'
  | 'rencana_magang'
  | 'tipeKonversi'
  | 'tgl_mulai'
  | 'tgl_berakhir'
  | 'matkulKonversi'
  | 'semester_konversi'
  | 'link_laporan_akhir'
  | 'link_output_magang'
  | 'nilai_dari_dosen'
  | 'nilai_kedisiplinan'
  | 'nilai_materi'
  | 'nilai_koding'
  | 'nilai_laporan'
  | 'nilai_mitra'
  | 'dosenId'
  | 'nama_dosen'
  | 'status_dosen'
  | 'dosenPengujiId'
  | 'nama_dosen_penguji'
  | 'status'
  | 'alasan_penolakan'
  | 'createdAt'
  | 'updatedAt'
>;

class Pengajuan
  extends Model<PengajuanAttributes, PengajuanCreationAttributes>
  implements PengajuanAttributes
{
  declare id: number;
  declare user_id: number;

  declare nama_mahasiswa: string;
  declare npm: string | null;
  declare program_studi: string | null;
  declare angkatan: string | null;
  declare semester: string | null;
  declare kelas: string | null;

  declare jenis_magang: string | null;
  declare no_hp_mahasiswa: string | null;
  declare foto_diri: string | null;
  declare bukti_penerimaan: string | null;

  declare perusahaan: string;
  declare posisi: string;
  declare link_loa: string | null;

  declare alamat_tempat_magang: string | null;
  declare nama_penanggung_jawab: string | null;
  declare kontak_penanggung_jawab: string | null;
  declare latitude: string | null;
  declare longitude: string | null;
  declare rencana_magang: string | null;

  declare tipeKonversi: string | null;
  declare tgl_mulai: Date | string | null;
  declare tgl_berakhir: Date | string | null;
  declare matkulKonversi: string | null;
  declare semester_konversi: string | null;

  declare link_laporan_akhir: string | null;
  declare link_output_magang: string | null;

  declare nilai_dari_dosen: string | null;
  declare nilai_kedisiplinan: number | null;
  declare nilai_materi: number | null;
  declare nilai_koding: number | null;
  declare nilai_laporan: number | null;
  declare nilai_mitra: number | null;

  declare dosenId: number | null;
  declare nama_dosen: string | null;
  declare status_dosen: StatusDosen | null;

  declare dosenPengujiId: number | null;
  declare nama_dosen_penguji: string | null;

  declare status: PengajuanStatus;
  declare alasan_penolakan: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Pengajuan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    nama_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    npm: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    program_studi: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    angkatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    semester: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    kelas: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    jenis_magang: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    no_hp_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    foto_diri: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    bukti_penerimaan: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    perusahaan: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    posisi: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    link_loa: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    alamat_tempat_magang: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    nama_penanggung_jawab: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    kontak_penanggung_jawab: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rencana_magang: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tipeKonversi: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tgl_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    tgl_berakhir: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    matkulKonversi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    semester_konversi: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    link_laporan_akhir: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    link_output_magang: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    nilai_dari_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    nilai_kedisiplinan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },

    nilai_materi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },

    nilai_koding: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },

    nilai_laporan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },

    nilai_mitra: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },

    dosenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    nama_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status_dosen: {
      type: DataTypes.ENUM('Menunggu', 'Disetujui', 'Ditolak'),
      allowNull: true,
      defaultValue: 'Menunggu',
    },

    dosenPengujiId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    nama_dosen_penguji: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        'Menunggu_Verifikasi',
        'Aktif',
        'Ditolak',
        'Selesai'
      ),
      allowNull: false,
      defaultValue: 'Menunggu_Verifikasi',
    },

    alasan_penolakan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pengajuan',
    timestamps: true,
  }
);

export default Pengajuan;