import { DataTypes } from 'sequelize';
import sequelize from '../lib/db';

const Logbook = sequelize.define('Logbook', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  nama_mahasiswa: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  tanggal: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  kegiatan: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  link_bukti: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'Menunggu Validasi' 
  },
  // FITUR BARU: Menyimpan catatan revisi dari dosen
  catatan_dosen: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  }
});

export default Logbook;