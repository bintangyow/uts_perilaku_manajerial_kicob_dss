import "dotenv/config";
import { db } from "../src/db";
import { assessments, behavioralScores } from "../src/db/schema";

async function resetData() {
  console.log("Cleaning up assessment data...");
  try {
    await db.delete(assessments);
    await db.delete(behavioralScores);
    console.log("✓ Success! All assessment data has been cleared.");
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}

resetData();
