import { NextResponse } from "next/server";
import sequelize, { connectDB } from "@/lib/db";

// Memanggil semua model agar Sequelize tahu tabel apa saja yang harus dibuat
import "@/models/User";
import "@/models/Job";
import "@/models/Pengajuan";
import "@/models/Logbook";
import "@/models/Feedback";

export async function GET() {
  try {
    // Memastikan koneksi ke database berjalan
    await connectDB();

    // Perintah otomatis untuk membuat tabel-tabel di database
   await sequelize.sync({ force: true });

    return NextResponse.json({ message: "Sukses! Tabel berhasil dibuat di Aiven." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}