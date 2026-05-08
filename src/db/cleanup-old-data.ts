import "dotenv/config";
import { db } from "./index";
import { 
  assessments, 
  behavioralScores, 
  recommendationHistory,
  projects,
  projectRequirements,
  teamCandidates,
  teamMembers
} from "./schema";

async function cleanup() {
  console.log("🧹 Memulai pembersihan total data lama...");

  try {
    // 1. Hapus data team members (FK ke candidates)
    await db.delete(teamMembers);
    console.log("- Data team_members dibersihkan.");

    // 2. Hapus data team candidates (FK ke projects)
    await db.delete(teamCandidates);
    console.log("- Data team_candidates dibersihkan.");

    // 3. Hapus data project requirements (FK ke projects)
    await db.delete(projectRequirements);
    console.log("- Data project_requirements dibersihkan.");

    // 4. Hapus data recommendation history (FK ke projects)
    await db.delete(recommendationHistory);
    console.log("- Data recommendation_history dibersihkan.");

    // 5. Hapus data projects
    await db.delete(projects);
    console.log("- Data projects dibersihkan.");

    // 6. Hapus data assessments & scores
    await db.delete(assessments);
    await db.delete(behavioralScores);
    console.log("- Data penilaian & skor perilaku dibersihkan.");

    console.log("✅ Pembersihan sukses! Sistem sekarang siap digunakan dengan data baru.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal membersihkan data:", err);
    process.exit(1);
  }
}

cleanup();
