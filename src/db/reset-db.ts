import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function resetDB() {
  console.log("⏳ Sedang mereset database dan ID...");
  
  try {
    // Perintah SQL sakti untuk hapus data & reset auto-increment ke 1
    const tables = [
      '"user"', // pake kutip karena 'user' adalah reserved word di postgres
      "employees",
      "skills",
      "employee_skills",
      "assessments",
      "behavioral_scores",
      "projects",
      "project_requirements",
      "team_candidates",
      "team_members",
      "recommendation_history",
      "session",
      "account",
      "verification"
    ];

    const query = `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE;`;
    
    await db.execute(sql.raw(query));

    console.log("✅ Berhasil! Semua tabel kosong dan ID telah kembali ke angka 1.");
    console.log("🚀 Sekarang Anda bisa daftar ulang dari awal dengan ID nomor 1.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal mereset database:", error);
    process.exit(1);
  }
}

resetDB();
