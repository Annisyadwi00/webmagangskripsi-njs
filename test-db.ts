import 'dotenv/config';
import { connectDB, syncDatabase } from './src/lib/db';
import PengajuanMitra from './src/models/PengajuanMitra';
import Pengajuan from './src/models/Pengajuan';

async function test() {
  try {
    await connectDB();
    console.log("DB connected");

    console.log("Running syncDatabase...");
    await syncDatabase();

    try {
      await PengajuanMitra.findAll({ limit: 1 });
      console.log("PengajuanMitra query OK");
    } catch (e: any) {
      console.error("PengajuanMitra Error:", e.message);
    }

    try {
      await Pengajuan.findAndCountAll({ limit: 1 });
      console.log("Pengajuan query OK");
    } catch (e: any) {
      console.error("Pengajuan Error:", e.message);
    }

    process.exit(0);
  } catch (err: any) {
    console.error("General Error:", err.message);
    process.exit(1);
  }
}

test();
