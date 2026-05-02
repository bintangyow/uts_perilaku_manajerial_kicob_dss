import { config } from "dotenv";
config(); // Load .env file

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
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

// Create db connection explicitly
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema: require("./schema") });

const firstNames = [
  "Rizky", "Dimas", "Budi", "Siti", "Agus", "Putri", "Dian", "Andi", "Fajar", "Ayu",
  "Bayu", "Cahyo", "Deni", "Eko", "Fitri", "Galih", "Hendra", "Indra", "Joko", "Kartika",
  "Lestari", "Maya", "Nugroho", "Oka", "Pratama", "Qori", "Ratna", "Suryo", "Tari", "Utami",
];

const lastNames = [
  "Foden", "Haaland", "De Bruyne", "Fernandes", "Saka", "Salah", "Alisson", "Van Dijk", "Rashford", "Garnacho",
  "Odegaard", "Rice", "Saliba", "Son", "Maddison", "Romero", "Watkins", "Martinez", "Isak", "Trippier",
  "Gordon", "Bowen", "Paqueta", "Sterling", "Palmer", "Silva", "Dias", "Rodri", "Grealish", "Doku",
];

const hardSkillsList = [
  "React", "Node.js", "Python", "PostgreSQL", "UI/UX Design",
  "Docker", "AWS", "Data Analysis", "Marketing", "Project Management"
];

const softSkillsList = [
  "Leadership", "Communication", "Problem Solving", "Time Management", "Adaptability"
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElements(arr: string[], num: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

async function seed() {
  console.log("Menghapus data lama...");
  // Using delete instead of truncate
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

  console.log("Generate Skills...");
  const skillInserts = [
    ...hardSkillsList.map(s => ({ skillName: s, category: "hard" })),
    ...softSkillsList.map(s => ({ skillName: s, category: "soft" })),
  ];
  
  const createdSkills = await db.insert(skills).values(skillInserts).returning();
  const dbHardSkills = createdSkills.filter(s => s.category === "hard");
  const dbSoftSkills = createdSkills.filter(s => s.category === "soft");

  console.log("Generate Users & Employees...");
  const newUsers = [];
  
  // Set up better-auth instance using the explicit db pool
  const { betterAuth } = require("better-auth");
  const { drizzleAdapter } = require("better-auth/adapters/drizzle");
  const seedAuth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: { enabled: true },
    user: { additionalFields: { role: { type: "string" } } }
  });

  const insertedUsers = [];

  for (let i = 0; i < 15; i++) {
    const fullName = `${firstNames[i]} ${lastNames[i]}`;
    const email = `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase().replace(" ", "")}@kicob.com`;
    
    let role = "reviewer";
    let dept = "Developer";
    let position = "Staff";
    
    if (i < 2) {
      role = "admin";
      dept = "IT Ops";
      position = "System Administrator";
    } else if (i < 4) {
      role = "hr";
      dept = "Human Resources";
      position = "HR Specialist";
    } else if (i < 8) {
      role = "manager";
      dept = i % 2 === 0 ? "Engineering" : "Product";
      position = "Manager";
    }

    try {
      // Use better-auth to properly create the user, account, and hash password
      // @ts-ignore - passing fake headers/request
      const res = await seedAuth.api.signUpEmail({
        body: {
          email: email,
          password: "password123",
          name: fullName,
          role: role
        }
      });
      if (res && res.user) {
        insertedUsers.push({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: role
        });
      }
    } catch (err) {
      console.error(`Gagal membuat user ${email}:`, err);
    }
  }

  const employeeInserts = insertedUsers.map((u, i) => {
    let dept = "Developer";
    let position = "Staff";
    if (u.role === "admin") { dept = "IT Ops"; position = "System Administrator"; }
    else if (u.role === "hr") { dept = "Human Resources"; position = "HR Specialist"; }
    else if (u.role === "manager") { dept = i % 2 === 0 ? "Engineering" : "Product"; position = "Manager"; }
    else {
      dept = i % 3 === 0 ? "Engineering" : (i % 3 === 1 ? "Design" : "Marketing");
      position = dept === "Engineering" ? "Software Engineer" : (dept === "Design" ? "UI/UX Designer" : "Marketing Specialist");
    }

    return {
      userId: u.id,
      employeeCode: `EMP${String(i + 1).padStart(3, "0")}`,
      name: u.name,
      email: u.email,
      department: dept,
      position: position,
    };
  });

  const insertedEmployees = await db.insert(employees).values(employeeInserts).returning();

  console.log("Generate Employee Skills & Assessments (dengan Trade-off)...");
  
  for (const emp of insertedEmployees) {
    // Determine Archetype
    // 0 = Expert (High Hard, Low Soft)
    // 1 = Leader (Low Hard, High Soft)
    // 2 = Average (Balanced)
    const archetype = getRandomInt(0, 2);

    let hardLevelRange = [3, 4];
    let softLevelRange = [3, 4];
    let behTarget = 3.5;

    if (archetype === 0) {
      hardLevelRange = [4, 5];
      softLevelRange = [2, 3];
      behTarget = 2.5; // Lower behavioral
    } else if (archetype === 1) {
      hardLevelRange = [2, 3];
      softLevelRange = [4, 5];
      behTarget = 4.5; // High behavioral
    }

    // Insert Hard Skills
    const numHard = getRandomInt(3, 5);
    const empHardSkills = getRandomElements(dbHardSkills.map(s => s.id.toString()), numHard);
    for (const sid of empHardSkills) {
      await db.insert(employeeSkills).values({
        employeeId: emp.id,
        skillId: Number(sid),
        level: getRandomInt(hardLevelRange[0], hardLevelRange[1])
      });
    }

    // Insert Soft Skills
    const numSoft = getRandomInt(2, 4);
    const empSoftSkills = getRandomElements(dbSoftSkills.map(s => s.id.toString()), numSoft);
    for (const sid of empSoftSkills) {
      await db.insert(employeeSkills).values({
        employeeId: emp.id,
        skillId: Number(sid),
        level: getRandomInt(softLevelRange[0], softLevelRange[1])
      });
    }

    // Generate Assessments
    const assessmentTypes = ["self", "peer", "peer", "supervisor"];
    let sumEmo = 0, sumComm = 0, sumTeam = 0, sumAdapt = 0;

    for (const atype of assessmentTypes) {
      const emo = Math.max(1, Math.min(5, behTarget + (Math.random() * 1.5 - 0.75)));
      const comm = Math.max(1, Math.min(5, behTarget + (Math.random() * 1.5 - 0.75)));
      const team = Math.max(1, Math.min(5, behTarget + (Math.random() * 1.5 - 0.75)));
      const adapt = Math.max(1, Math.min(5, behTarget + (Math.random() * 1.5 - 0.75)));

      await db.insert(assessments).values({
        employeeId: emp.id,
        assessorName: atype === "self" ? emp.name : `Assessor ${getRandomInt(1, 10)}`,
        assessmentType: atype,
        emotionalStability: Number(emo.toFixed(1)),
        communication: Number(comm.toFixed(1)),
        teamwork: Number(team.toFixed(1)),
        adaptability: Number(adapt.toFixed(1)),
        consistencyScore: Number((Math.random() * 10 + 80).toFixed(1)), // 80-90
      });

      sumEmo += emo; sumComm += comm; sumTeam += team; sumAdapt += adapt;
    }

    // Insert Behavioral Scores
    const avgEmo = sumEmo / 4;
    const avgComm = sumComm / 4;
    const avgTeam = sumTeam / 4;
    const avgAdapt = sumAdapt / 4;
    const finalScore = (avgEmo + avgComm + avgTeam + avgAdapt) / 4;

    await db.insert(behavioralScores).values({
      employeeId: emp.id,
      avgEmotionalStability: Number(avgEmo.toFixed(1)),
      avgCommunication: Number(avgComm.toFixed(1)),
      avgTeamwork: Number(avgTeam.toFixed(1)),
      avgAdaptability: Number(avgAdapt.toFixed(1)),
      finalBehaviorScore: Number(finalScore.toFixed(1)),
    });
  }

  console.log("Seeding selesai dengan sukses! 30 Karyawan + Skills + Assessments berhasil di-generate.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Terjadi kesalahan saat seeding:", err);
  process.exit(1);
});
