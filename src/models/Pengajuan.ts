import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type PengajuanStatus =
  | 'Menunggu_Verifikasi'
  | 'Pilih_Dosen'
  | 'Aktif'
  | 'Ditolak'
  | 'Selesai';

export type StatusDosen = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type PengajuanAttributes = {
  id: number;
  user_id: number;
  nama_mahasiswa: string;
  perusahaan: string;
  posisi: string;
  link_loa: string | null;

  jenis_magang: string | null;
  no_hp_mahasiswa: string | null;
  foto_diri: string | null;
  bukti_penerimaan: string | null;
  alamat_tempat_magang: string | null;
  nama_penanggung_jawab: string | null;
  kontak_penanggung_jawab: string | null;
  latitude: string | null;
  longitude: string | null;
  rencana_magang: string | null;
  npm: string | null;
  program_studi: string | null;
  angkatan: string | null;
  kelas: string | null;

  tipeKonversi: string | null;
  tgl_mulai: Date | string | null;
  tgl_berakhir: Date | string | null;
  matkulKonversi: string | null;
  link_laporan_akhir: string | null;
  nilai_dari_dosen: string | null;
  dosenId: number | null;
  nama_dosen: string | null;
  nilai_kedisiplinan: number | null;
  nilai_materi: number | null;
  nilai_koding: number | null;
  nilai_laporan: number | null;
  status: PengajuanStatus;
  status_dosen: StatusDosen | null;
  semester_konversi: string | null;
  alasan_penolakan: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PengajuanCreationAttributes = Optional<
  PengajuanAttributes,
  | 'id'
  | 'link_loa'
  | 'tipeKonversi'
  | 'tgl_mulai'
  | 'tgl_berakhir'
  | 'matkulKonversi'
  | 'link_laporan_akhir'
  | 'nilai_dari_dosen'
  | 'dosenId'
  | 'nama_dosen'
  | 'nilai_kedisiplinan'
  | 'nilai_materi'
  | 'nilai_koding'
  | 'nilai_laporan'
  | 'status'
  | 'status_dosen'
  | 'semester_konversi'
  | 'alasan_penolakan'
  | 'createdAt'
  | 'updatedAt'
  | 'jenis_magang'
| 'no_hp_mahasiswa'
| 'foto_diri'
| 'bukti_penerimaan'
| 'alamat_tempat_magang'
| 'nama_penanggung_jawab'
| 'kontak_penanggung_jawab'
| 'latitude'
| 'longitude'
| 'rencana_magang'
| 'npm'
| 'program_studi'
| 'angkatan'
| 'kelas'
>;

class Pengajuan extends Model<
  PengajuanAttributes,
  PengajuanCreationAttributes
> {
  declare id: number;
  declare user_id: number;
  declare nama_mahasiswa: string;
  declare perusahaan: string;
  declare posisi: string;
  declare link_loa: string | null;
  declare jenis_magang: string | null;
declare no_hp_mahasiswa: string | null;
declare foto_diri: string | null;
declare bukti_penerimaan: string | null;
declare alamat_tempat_magang: string | null;
declare nama_penanggung_jawab: string | null;
declare kontak_penanggung_jawab: string | null;
declare latitude: string | null;
declare longitude: string | null;
declare rencana_magang: string | null;
declare npm: string | null;
declare program_studi: string | null;
declare angkatan: string | null;
declare kelas: string | null;
  declare tipeKonversi: string | null;
  declare tgl_mulai: Date | string | null;
  declare tgl_berakhir: Date | string | null;
  declare matkulKonversi: string | null;
  declare link_laporan_akhir: string | null;
  declare nilai_dari_dosen: string | null;
  declare dosenId: number | null;
  declare nama_dosen: string | null;
  declare nilai_kedisiplinan: number | null;
  declare nilai_materi: number | null;
  declare nilai_koding: number | null;
  declare nilai_laporan: number | null;
  declare status: PengajuanStatus;
  declare status_dosen: StatusDosen | null;
  declare semester_konversi: string | null;
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
    perusahaan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    posisi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_loa: {
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
    kelas: {
      type: DataTypes.STRING,
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
    link_laporan_akhir: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nilai_dari_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dosenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nilai_kedisiplinan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nilai_materi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nilai_koding: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nilai_laporan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'Menunggu_Verifikasi',
        'Pilih_Dosen',
        'Aktif',
        'Ditolak',
        'Selesai'
      ),
      allowNull: false,
      defaultValue: 'Menunggu_Verifikasi',
    },
    status_dosen: {
      type: DataTypes.ENUM('Menunggu', 'Disetujui', 'Ditolak'),
      allowNull: true,
      defaultValue: 'Menunggu',
    },
    semester_konversi: {
      type: DataTypes.STRING,
      allowNull: true,
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