import "dotenv/config";
import { db } from "../src/db";
import { skills } from "../src/db/schema";

async function check() {
  const res = await db.select().from(skills);
  console.log("--- DAFTAR SKILLS ---");
  res.forEach(s => console.log(`- [${s.category}] ${s.skillName}`));
}
check();
