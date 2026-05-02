import { config } from "dotenv";
config(); // Load .env file

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  user,
  employees,
  skills,
  employeeSkills,
  assessments,
  behavioralScores,
  projects,
  projectRequirements,
  teamCandidates,
  teamMembers,
  recommendationHistory,
} from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema: require("./schema") });

async function clear() {
  console.log("Menghapus semua data (Reset ke 0)...");
  await db.delete(teamMembers);
  await db.delete(teamCandidates);
  await db.delete(projectRequirements);
  await db.delete(recommendationHistory);
  await db.delete(projects);
  await db.delete(behavioralScores);
  await db.delete(assessments);
  await db.delete(employeeSkills);
  await db.delete(employees);
  await db.delete(skills);
  await db.delete(user);
  
  console.log("Database berhasil dibersihkan! Semua data demo telah dihapus.");
  process.exit(0);
}

clear().catch((err) => {
  console.error("Gagal membersihkan database:", err);
  process.exit(1);
});
