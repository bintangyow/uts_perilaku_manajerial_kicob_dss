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

import * as schema from "./schema";

// Create db connection explicitly
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

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
  await db.delete(schema.teamMembers);
  await db.delete(schema.teamCandidates);
  await db.delete(schema.projectRequirements);
  await db.delete(schema.recommendationHistory);
  await db.delete(schema.projects);
  await db.delete(schema.behavioralScores);
  await db.delete(schema.assessments);
  await db.delete(schema.assessmentPeriods);
  await db.delete(schema.employeeSkills);
  await db.delete(schema.employees);
  await db.delete(schema.skills);
  await db.delete(schema.user);

  console.log("Generate Skills...");
  const skillInserts = [
    ...hardSkillsList.map(s => ({ skillName: s, category: "hard" })),
    ...softSkillsList.map(s => ({ skillName: s, category: "soft" })),
  ];
  
  const createdSkills = await db.insert(schema.skills).values(skillInserts).returning();
  const dbHardSkills = createdSkills.filter(s => s.category === "hard");
  const dbSoftSkills = createdSkills.filter(s => s.category === "soft");

  console.log("Generate Users & Employees...");
  
  // Set up better-auth instance using the explicit db pool
  const { betterAuth } = await import("better-auth");
  const { drizzleAdapter } = await import("better-auth/adapters/drizzle");
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
    
    if (i < 2) {
      role = "admin";
    } else if (i < 4) {
      role = "hr";
    } else if (i < 8) {
      role = "manager";
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

  console.log("Generate Departments & Positions...");
  const deptNames = ["IT Ops", "Human Resources", "Engineering", "Product", "Design", "Marketing"];
  const depts = await db.insert(schema.departments).values(deptNames.map(name => ({ name }))).returning();
  
  const posNames = ["System Administrator", "HR Specialist", "Manager", "Software Engineer", "UI/UX Designer", "Marketing Specialist"];
  const poss = await db.insert(schema.positions).values(posNames.map(name => ({ name, jobLevel: name === "Manager" ? 3 : 1 }))).returning();

  const employeeInserts = insertedUsers.map((u, i) => {
    let deptName = "Engineering";
    let posName = "Software Engineer";
    
    if (u.role === "admin") { deptName = "IT Ops"; posName = "System Administrator"; }
    else if (u.role === "hr") { deptName = "Human Resources"; posName = "HR Specialist"; }
    else if (u.role === "manager") { deptName = i % 2 === 0 ? "Engineering" : "Product"; posName = "Manager"; }
    else {
      deptName = i % 3 === 0 ? "Engineering" : (i % 3 === 1 ? "Design" : "Marketing");
      posName = deptName === "Engineering" ? "Software Engineer" : (deptName === "Design" ? "UI/UX Designer" : "Marketing Specialist");
    }

    const deptId = depts.find(d => d.name === deptName)?.id;
    const posId = poss.find(p => p.name === posName)?.id;

    return {
      userId: u.id,
      employeeCode: `EMP${String(i + 1).padStart(3, "0")}`,
      departmentId: deptId,
      positionId: posId,
    };
  });

  const insertedEmployees = await db.insert(schema.employees).values(employeeInserts).returning();

  console.log("Generate Periods...");
  const [activePeriod] = await db.insert(schema.assessmentPeriods).values({
    name: "Mei 2026",
    status: "active",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-31"),
    isCurrent: true,
  }).returning();

  console.log("Generate Employee Skills & Assessments (dengan Trade-off)...");
  
  for (const emp of insertedEmployees) {
    // Determine Archetype
    const archetype = getRandomInt(0, 2);

    let hardLevelRange = [3, 4];
    let softLevelRange = [3, 4];
    let behTarget = 3.5;

    if (archetype === 0) {
      hardLevelRange = [4, 5];
      softLevelRange = [2, 3];
      behTarget = 2.5; 
    } else if (archetype === 1) {
      hardLevelRange = [2, 3];
      softLevelRange = [4, 5];
      behTarget = 4.5; 
    }

    // Insert Hard Skills
    const numHard = getRandomInt(3, 5);
    const empHardSkills = getRandomElements(dbHardSkills.map(s => s.id.toString()), numHard);
    for (const sid of empHardSkills) {
      await db.insert(schema.employeeSkills).values({
        employeeId: emp.id,
        skillId: Number(sid),
        level: getRandomInt(hardLevelRange[0], hardLevelRange[1])
      });
    }

    // Insert Soft Skills
    const numSoft = getRandomInt(2, 4);
    const empSoftSkills = getRandomElements(dbSoftSkills.map(s => s.id.toString()), numSoft);
    for (const sid of empSoftSkills) {
      await db.insert(schema.employeeSkills).values({
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

      await db.insert(schema.assessments).values({
        employeeId: emp.id,
        assessorName: atype === "self" ? (insertedUsers.find(u => u.id === emp.userId)?.name || "Karyawan") : `Assessor ${getRandomInt(1, 10)}`,
        assessmentType: atype,
        emotionalStability: emo.toFixed(1),
        communication: comm.toFixed(1),
        teamwork: team.toFixed(1),
        adaptability: adapt.toFixed(1),
        consistencyScore: (Math.random() * 10 + 80).toFixed(1),
        periodId: activePeriod.id,
      });

      sumEmo += emo; sumComm += comm; sumTeam += team; sumAdapt += adapt;
    }

    // Insert Behavioral Scores
    const avgEmo = sumEmo / 4;
    const avgComm = sumComm / 4;
    const avgTeam = sumTeam / 4;
    const avgAdapt = sumAdapt / 4;
    const finalScore = (avgEmo + avgComm + avgTeam + avgAdapt) / 4;

    await db.insert(schema.behavioralScores).values({
      employeeId: emp.id,
      avgEmotionalStability: avgEmo.toFixed(1),
      avgCommunication: avgComm.toFixed(1),
      avgTeamwork: avgTeam.toFixed(1),
      avgAdaptability: avgAdapt.toFixed(1),
      finalBehaviorScore: finalScore.toFixed(1),
    });
  }

  console.log("Seeding selesai dengan sukses!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Terjadi kesalahan saat seeding:", err);
  process.exit(1);
});
