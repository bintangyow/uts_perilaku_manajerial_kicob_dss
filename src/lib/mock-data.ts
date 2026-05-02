// ============================================================
// KiCob — Mock Data Layer
// ============================================================

import type {
  Role,
  User,
  Employee,
  Skill,
  EmployeeSkill,
  Assessment,
  BehavioralScore,
  Project,
  ProjectRequirement,
  TeamCandidate,
  TeamMember,
  RecommendationHistory,
  EmployeeWithSkills,
  ProjectWithRequirements,
} from "./types";

// ─── Roles ───────────────────────────────────────────────────
export const roles: Role[] = [
  { id: 1, name: "admin", label: "Administrator" },
  { id: 2, name: "manager", label: "Manajer" },
  { id: 3, name: "hr", label: "HR" },
  { id: 4, name: "reviewer", label: "Reviewer" },
];

// ─── Users ───────────────────────────────────────────────────
export const users: User[] = [
  { id: 1, name: "Admin Utama", email: "admin@kicob.id", roleId: 1, role: roles[0] },
  { id: 2, name: "Budi Santoso", email: "budi@kicob.id", roleId: 2, role: roles[1] },
  { id: 3, name: "Sari Dewi", email: "sari@kicob.id", roleId: 3, role: roles[2] },
  { id: 4, name: "Rini Hartati", email: "rini@kicob.id", roleId: 4, role: roles[3] },
];

// ─── Employees ───────────────────────────────────────────────
export const employees: Employee[] = [
  { id: 1, userId: 5, employeeCode: "EMP001", department: "Engineering", position: "Frontend Developer", status: "active", user: { id: 5, name: "Andi Pratama", email: "andi@kicob.id", roleId: 4, role: roles[3] } },
  { id: 2, userId: 6, employeeCode: "EMP002", department: "Engineering", position: "Backend Developer", status: "active", user: { id: 6, name: "Dewi Lestari", email: "dewi@kicob.id", roleId: 4, role: roles[3] } },
  { id: 3, userId: 7, employeeCode: "EMP003", department: "Engineering", position: "Fullstack Developer", status: "active", user: { id: 7, name: "Fajar Nugroho", email: "fajar@kicob.id", roleId: 4, role: roles[3] } },
  { id: 4, userId: 8, employeeCode: "EMP004", department: "Design", position: "UI/UX Designer", status: "active", user: { id: 8, name: "Gita Purnama", email: "gita@kicob.id", roleId: 4, role: roles[3] } },
  { id: 5, userId: 9, employeeCode: "EMP005", department: "Design", position: "Graphic Designer", status: "active", user: { id: 9, name: "Hendra Wijaya", email: "hendra@kicob.id", roleId: 4, role: roles[3] } },
  { id: 6, userId: 10, employeeCode: "EMP006", department: "Data", position: "Data Analyst", status: "active", user: { id: 10, name: "Indah Sari", email: "indah@kicob.id", roleId: 4, role: roles[3] } },
  { id: 7, userId: 11, employeeCode: "EMP007", department: "Data", position: "Data Engineer", status: "active", user: { id: 11, name: "Joko Susanto", email: "joko@kicob.id", roleId: 4, role: roles[3] } },
  { id: 8, userId: 12, employeeCode: "EMP008", department: "Engineering", position: "DevOps Engineer", status: "active", user: { id: 12, name: "Kartika Sari", email: "kartika@kicob.id", roleId: 4, role: roles[3] } },
  { id: 9, userId: 13, employeeCode: "EMP009", department: "Product", position: "Product Manager", status: "active", user: { id: 13, name: "Lukman Hakim", email: "lukman@kicob.id", roleId: 4, role: roles[3] } },
  { id: 10, userId: 14, employeeCode: "EMP010", department: "QA", position: "QA Engineer", status: "active", user: { id: 14, name: "Maya Putri", email: "maya@kicob.id", roleId: 4, role: roles[3] } },
  { id: 11, userId: 15, employeeCode: "EMP011", department: "Engineering", position: "Mobile Developer", status: "active", user: { id: 15, name: "Nanda Rahman", email: "nanda@kicob.id", roleId: 4, role: roles[3] } },
  { id: 12, userId: 16, employeeCode: "EMP012", department: "Engineering", position: "Senior Developer", status: "inactive", user: { id: 16, name: "Oscar Hidayat", email: "oscar@kicob.id", roleId: 4, role: roles[3] } },
];

// ─── Skills ──────────────────────────────────────────────────
export const skills: Skill[] = [
  { id: 1, skillName: "React", category: "hard" },
  { id: 2, skillName: "Node.js", category: "hard" },
  { id: 3, skillName: "Python", category: "hard" },
  { id: 4, skillName: "SQL", category: "hard" },
  { id: 5, skillName: "Docker", category: "hard" },
  { id: 6, skillName: "TypeScript", category: "hard" },
  { id: 7, skillName: "Figma", category: "hard" },
  { id: 8, skillName: "Machine Learning", category: "hard" },
  { id: 9, skillName: "Komunikasi", category: "soft" },
  { id: 10, skillName: "Kepemimpinan", category: "soft" },
  { id: 11, skillName: "Problem Solving", category: "soft" },
  { id: 12, skillName: "Kerja Tim", category: "soft" },
];

// ─── Employee Skills ─────────────────────────────────────────
export const employeeSkills: EmployeeSkill[] = [
  // Andi - Frontend
  { id: 1, employeeId: 1, skillId: 1, level: 5, skill: skills[0] },
  { id: 2, employeeId: 1, skillId: 6, level: 4, skill: skills[5] },
  { id: 3, employeeId: 1, skillId: 7, level: 3, skill: skills[6] },
  // Dewi - Backend
  { id: 4, employeeId: 2, skillId: 2, level: 5, skill: skills[1] },
  { id: 5, employeeId: 2, skillId: 4, level: 4, skill: skills[3] },
  { id: 6, employeeId: 2, skillId: 5, level: 3, skill: skills[4] },
  // Fajar - Fullstack
  { id: 7, employeeId: 3, skillId: 1, level: 4, skill: skills[0] },
  { id: 8, employeeId: 3, skillId: 2, level: 4, skill: skills[1] },
  { id: 9, employeeId: 3, skillId: 6, level: 4, skill: skills[5] },
  // Gita - Designer
  { id: 10, employeeId: 4, skillId: 7, level: 5, skill: skills[6] },
  { id: 11, employeeId: 4, skillId: 1, level: 2, skill: skills[0] },
  // Hendra - Graphic
  { id: 12, employeeId: 5, skillId: 7, level: 4, skill: skills[6] },
  // Indah - Data Analyst
  { id: 13, employeeId: 6, skillId: 3, level: 4, skill: skills[2] },
  { id: 14, employeeId: 6, skillId: 4, level: 5, skill: skills[3] },
  { id: 15, employeeId: 6, skillId: 8, level: 3, skill: skills[7] },
  // Joko - Data Engineer
  { id: 16, employeeId: 7, skillId: 3, level: 5, skill: skills[2] },
  { id: 17, employeeId: 7, skillId: 4, level: 4, skill: skills[3] },
  { id: 18, employeeId: 7, skillId: 5, level: 4, skill: skills[4] },
  // Kartika - DevOps
  { id: 19, employeeId: 8, skillId: 5, level: 5, skill: skills[4] },
  { id: 20, employeeId: 8, skillId: 2, level: 3, skill: skills[1] },
  // Lukman - PM
  { id: 21, employeeId: 9, skillId: 7, level: 3, skill: skills[6] },
  // Maya - QA
  { id: 22, employeeId: 10, skillId: 6, level: 3, skill: skills[5] },
  { id: 23, employeeId: 10, skillId: 4, level: 3, skill: skills[3] },
  // Nanda - Mobile
  { id: 24, employeeId: 11, skillId: 1, level: 4, skill: skills[0] },
  { id: 25, employeeId: 11, skillId: 6, level: 4, skill: skills[5] },
  // Oscar - Senior
  { id: 26, employeeId: 12, skillId: 1, level: 5, skill: skills[0] },
  { id: 27, employeeId: 12, skillId: 2, level: 5, skill: skills[1] },
  { id: 28, employeeId: 12, skillId: 6, level: 5, skill: skills[5] },
];

// ─── Behavioral Scores ──────────────────────────────────────
export const behavioralScores: BehavioralScore[] = [
  { id: 1, employeeId: 1, avgEmotionalStability: 4.2, avgCommunication: 4.5, avgTeamwork: 4.8, avgAdaptability: 4.0, finalBehaviorScore: 4.38, updatedAt: "2026-04-28" },
  { id: 2, employeeId: 2, avgEmotionalStability: 3.8, avgCommunication: 3.5, avgTeamwork: 4.2, avgAdaptability: 4.5, finalBehaviorScore: 4.00, updatedAt: "2026-04-28" },
  { id: 3, employeeId: 3, avgEmotionalStability: 4.5, avgCommunication: 4.0, avgTeamwork: 4.3, avgAdaptability: 4.7, finalBehaviorScore: 4.38, updatedAt: "2026-04-28" },
  { id: 4, employeeId: 4, avgEmotionalStability: 4.0, avgCommunication: 4.8, avgTeamwork: 4.5, avgAdaptability: 3.8, finalBehaviorScore: 4.28, updatedAt: "2026-04-28" },
  { id: 5, employeeId: 5, avgEmotionalStability: 3.5, avgCommunication: 3.8, avgTeamwork: 4.0, avgAdaptability: 3.5, finalBehaviorScore: 3.70, updatedAt: "2026-04-28" },
  { id: 6, employeeId: 6, avgEmotionalStability: 4.5, avgCommunication: 4.2, avgTeamwork: 4.0, avgAdaptability: 4.3, finalBehaviorScore: 4.25, updatedAt: "2026-04-28" },
  { id: 7, employeeId: 7, avgEmotionalStability: 4.0, avgCommunication: 3.5, avgTeamwork: 3.8, avgAdaptability: 4.0, finalBehaviorScore: 3.83, updatedAt: "2026-04-28" },
  { id: 8, employeeId: 8, avgEmotionalStability: 4.2, avgCommunication: 4.0, avgTeamwork: 4.5, avgAdaptability: 4.8, finalBehaviorScore: 4.38, updatedAt: "2026-04-28" },
  { id: 9, employeeId: 9, avgEmotionalStability: 4.8, avgCommunication: 4.9, avgTeamwork: 4.5, avgAdaptability: 4.2, finalBehaviorScore: 4.60, updatedAt: "2026-04-28" },
  { id: 10, employeeId: 10, avgEmotionalStability: 4.0, avgCommunication: 3.8, avgTeamwork: 4.2, avgAdaptability: 3.5, finalBehaviorScore: 3.88, updatedAt: "2026-04-28" },
  { id: 11, employeeId: 11, avgEmotionalStability: 3.8, avgCommunication: 4.0, avgTeamwork: 4.3, avgAdaptability: 4.5, finalBehaviorScore: 4.15, updatedAt: "2026-04-28" },
  { id: 12, employeeId: 12, avgEmotionalStability: 4.5, avgCommunication: 4.2, avgTeamwork: 3.5, avgAdaptability: 3.8, finalBehaviorScore: 4.00, updatedAt: "2026-04-28" },
];

// ─── Assessments ─────────────────────────────────────────────
export const assessments: Assessment[] = [
  { id: 1, assessorId: 1, employeeId: 1, assessmentType: "self", emotionalStability: 4.0, communication: 4.5, teamwork: 5.0, adaptability: 4.0, consistencyScore: 0.85, createdAt: "2026-04-20" },
  { id: 2, assessorId: 2, employeeId: 1, assessmentType: "supervisor", emotionalStability: 4.5, communication: 4.5, teamwork: 4.5, adaptability: 4.0, consistencyScore: 0.92, createdAt: "2026-04-21" },
  { id: 3, assessorId: 3, employeeId: 1, assessmentType: "peer", emotionalStability: 4.0, communication: 4.5, teamwork: 5.0, adaptability: 4.0, consistencyScore: 0.88, createdAt: "2026-04-22" },
  { id: 4, assessorId: 1, employeeId: 2, assessmentType: "self", emotionalStability: 4.0, communication: 3.5, teamwork: 4.0, adaptability: 4.5, consistencyScore: 0.80, createdAt: "2026-04-20" },
  { id: 5, assessorId: 2, employeeId: 2, assessmentType: "supervisor", emotionalStability: 3.5, communication: 3.5, teamwork: 4.5, adaptability: 4.5, consistencyScore: 0.90, createdAt: "2026-04-21" },
  { id: 6, assessorId: 4, employeeId: 3, assessmentType: "peer", emotionalStability: 4.5, communication: 4.0, teamwork: 4.5, adaptability: 5.0, consistencyScore: 0.91, createdAt: "2026-04-22" },
  { id: 7, assessorId: 2, employeeId: 4, assessmentType: "supervisor", emotionalStability: 4.0, communication: 5.0, teamwork: 4.5, adaptability: 3.5, consistencyScore: 0.87, createdAt: "2026-04-23" },
  { id: 8, assessorId: 1, employeeId: 5, assessmentType: "self", emotionalStability: 3.5, communication: 4.0, teamwork: 4.0, adaptability: 3.5, consistencyScore: 0.78, createdAt: "2026-04-20" },
  { id: 9, assessorId: 2, employeeId: 6, assessmentType: "supervisor", emotionalStability: 4.5, communication: 4.0, teamwork: 4.0, adaptability: 4.5, consistencyScore: 0.93, createdAt: "2026-04-24" },
  { id: 10, assessorId: 4, employeeId: 7, assessmentType: "peer", emotionalStability: 4.0, communication: 3.5, teamwork: 3.5, adaptability: 4.0, consistencyScore: 0.82, createdAt: "2026-04-22" },
];

// ─── Projects ────────────────────────────────────────────────
export const projects: Project[] = [
  { id: 1, createdBy: 2, projectName: "Platform E-Commerce Baru", description: "Membangun platform e-commerce modern dengan fitur marketplace, payment gateway, dan analytics dashboard.", teamSize: 5, hardSkillWeight: 0.6, softFactorWeight: 0.4, status: "active", createdAt: "2026-04-15" },
  { id: 2, createdBy: 2, projectName: "Aplikasi Mobile Banking", description: "Pengembangan aplikasi mobile banking dengan fitur transfer, investasi, dan integrasi QRIS.", teamSize: 4, hardSkillWeight: 0.5, softFactorWeight: 0.5, status: "draft", createdAt: "2026-04-20" },
  { id: 3, createdBy: 2, projectName: "Data Analytics Dashboard", description: "Dashboard analitik untuk monitoring performa bisnis real-time dengan visualisasi interaktif.", teamSize: 3, hardSkillWeight: 0.7, softFactorWeight: 0.3, status: "completed", createdAt: "2026-03-01" },
];

// ─── Project Requirements ────────────────────────────────────
export const projectRequirements: ProjectRequirement[] = [
  // E-Commerce project
  { id: 1, projectId: 1, skillId: 1, requiredLevel: 4, isMandatory: true, skill: skills[0] },
  { id: 2, projectId: 1, skillId: 2, requiredLevel: 4, isMandatory: true, skill: skills[1] },
  { id: 3, projectId: 1, skillId: 6, requiredLevel: 3, isMandatory: true, skill: skills[5] },
  { id: 4, projectId: 1, skillId: 7, requiredLevel: 3, isMandatory: false, skill: skills[6] },
  { id: 5, projectId: 1, skillId: 5, requiredLevel: 3, isMandatory: false, skill: skills[4] },
  // Mobile Banking
  { id: 6, projectId: 2, skillId: 1, requiredLevel: 4, isMandatory: true, skill: skills[0] },
  { id: 7, projectId: 2, skillId: 6, requiredLevel: 4, isMandatory: true, skill: skills[5] },
  { id: 8, projectId: 2, skillId: 4, requiredLevel: 3, isMandatory: true, skill: skills[3] },
  // Data Analytics
  { id: 9, projectId: 3, skillId: 3, requiredLevel: 4, isMandatory: true, skill: skills[2] },
  { id: 10, projectId: 3, skillId: 4, requiredLevel: 4, isMandatory: true, skill: skills[3] },
  { id: 11, projectId: 3, skillId: 8, requiredLevel: 3, isMandatory: false, skill: skills[7] },
];

// ─── Team Candidates ─────────────────────────────────────────
export const teamCandidates: TeamCandidate[] = [
  {
    id: 1, projectId: 1, totalScore: 92.5, ranking: 1, generatedAt: "2026-04-25",
    members: [
      { id: 1, teamCandidateId: 1, employeeId: 1, contributionScore: 94, employee: employees[0], hardSkillScore: 95, softFactorScore: 92 },
      { id: 2, teamCandidateId: 1, employeeId: 2, contributionScore: 91, employee: employees[1], hardSkillScore: 93, softFactorScore: 88 },
      { id: 3, teamCandidateId: 1, employeeId: 3, contributionScore: 93, employee: employees[2], hardSkillScore: 90, softFactorScore: 96 },
      { id: 4, teamCandidateId: 1, employeeId: 4, contributionScore: 88, employee: employees[3], hardSkillScore: 85, softFactorScore: 92 },
      { id: 5, teamCandidateId: 1, employeeId: 8, contributionScore: 90, employee: employees[7], hardSkillScore: 92, softFactorScore: 87 },
    ],
  },
  {
    id: 2, projectId: 1, totalScore: 88.2, ranking: 2, generatedAt: "2026-04-25",
    members: [
      { id: 6, teamCandidateId: 2, employeeId: 1, contributionScore: 94, employee: employees[0], hardSkillScore: 95, softFactorScore: 92 },
      { id: 7, teamCandidateId: 2, employeeId: 3, contributionScore: 93, employee: employees[2], hardSkillScore: 90, softFactorScore: 96 },
      { id: 8, teamCandidateId: 2, employeeId: 11, contributionScore: 86, employee: employees[10], hardSkillScore: 84, softFactorScore: 88 },
      { id: 9, teamCandidateId: 2, employeeId: 4, contributionScore: 88, employee: employees[3], hardSkillScore: 85, softFactorScore: 92 },
      { id: 10, teamCandidateId: 2, employeeId: 8, contributionScore: 90, employee: employees[7], hardSkillScore: 92, softFactorScore: 87 },
    ],
  },
];

// ─── Recommendation History ──────────────────────────────────
export const recommendationHistory: RecommendationHistory[] = [
  { id: 1, projectId: 3, approvedBy: 2, decisionNote: "Tim yang direkomendasikan sesuai kebutuhan proyek. Komposisi skill sudah seimbang.", status: "approved", createdAt: "2026-03-15", project: projects[2], approver: users[1] },
  { id: 2, projectId: 1, approvedBy: 2, decisionNote: "Perlu pertimbangan ulang untuk posisi DevOps, kandidat alternatif dibutuhkan.", status: "adjusted", createdAt: "2026-04-26", project: projects[0], approver: users[1] },
];

// ─── Helper Functions ────────────────────────────────────────

export function getEmployeeWithSkills(employeeId: number): EmployeeWithSkills | undefined {
  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) return undefined;
  return {
    ...emp,
    skills: employeeSkills.filter((es) => es.employeeId === employeeId),
    behavioralScore: behavioralScores.find((bs) => bs.employeeId === employeeId),
  };
}

export function getProjectWithRequirements(projectId: number): ProjectWithRequirements | undefined {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return undefined;
  return {
    ...proj,
    requirements: projectRequirements.filter((pr) => pr.projectId === projectId),
    teamCandidates: teamCandidates.filter((tc) => tc.projectId === projectId),
  };
}

export function getAllEmployeesWithSkills(): EmployeeWithSkills[] {
  return employees.map((emp) => ({
    ...emp,
    skills: employeeSkills.filter((es) => es.employeeId === emp.id),
    behavioralScore: behavioralScores.find((bs) => bs.employeeId === emp.id),
  }));
}
