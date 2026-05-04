import { db } from "@/db";
import { 
  projects, 
  teamCandidates, 
  teamMembers, 
  assessments, 
  behavioralScores, 
  recommendationHistory 
} from "@/db/schema";

export async function POST() {
  try {
    // Delete in correct order for foreign keys
    await db.delete(teamMembers);
    await db.delete(teamCandidates);
    await db.delete(recommendationHistory);
    await db.delete(projects);
    await db.delete(assessments);
    await db.delete(behavioralScores);
    
    return Response.json({ success: true, message: "Seluruh data operasional telah dibersihkan." });
  } catch (error: any) {
    console.error("System Reset Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
