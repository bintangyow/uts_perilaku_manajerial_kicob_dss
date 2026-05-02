// ============================================================
// KiCob — TypeScript Types (sesuai DB Schema di PRD)
// ============================================================

export type RoleName = "manager" | "hr" | "reviewer" | "admin";

export interface Role {
  id: number;
  name: RoleName;
  label: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: Role;
}

export interface Employee {
  id: number;
  userId: number;
  employeeCode: string;
  department: string;
  position: string;
  status: "active" | "inactive";
  user: User;
}

export interface Skill {
  id: number;
  skillName: string;
  category: "hard" | "soft";
}

export interface EmployeeSkill {
  id: number;
  employeeId: number;
  skillId: number;
  level: number; // 1-5
  skill: Skill;
}

export interface Assessment {
  id: number;
  assessorId: number;
  employeeId: number;
  assessmentType: "self" | "peer" | "supervisor";
  emotionalStability: number;
  communication: number;
  teamwork: number;
  adaptability: number;
  consistencyScore: number;
  createdAt: string;
  assessor?: User;
  employee?: Employee;
}

export interface BehavioralScore {
  id: number;
  employeeId: number;
  avgEmotionalStability: number;
  avgCommunication: number;
  avgTeamwork: number;
  avgAdaptability: number;
  finalBehaviorScore: number;
  updatedAt: string;
}

export type ProjectStatus = "draft" | "active" | "completed";

export interface Project {
  id: number;
  createdBy: number;
  projectName: string;
  description: string;
  teamSize: number;
  hardSkillWeight: number;
  softFactorWeight: number;
  status: ProjectStatus;
  createdAt: string;
}

export interface ProjectRequirement {
  id: number;
  projectId: number;
  skillId: number;
  requiredLevel: number;
  isMandatory: boolean;
  skill: Skill;
}

export interface TeamCandidate {
  id: number;
  projectId: number;
  totalScore: number;
  ranking: number;
  generatedAt: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: number;
  teamCandidateId: number;
  employeeId: number;
  contributionScore: number;
  employee: Employee;
  hardSkillScore?: number;
  softFactorScore?: number;
}

export interface RecommendationHistory {
  id: number;
  projectId: number;
  approvedBy: number;
  decisionNote: string;
  status: "approved" | "rejected" | "adjusted";
  createdAt: string;
  project?: Project;
  approver?: User;
}

// Computed types for UI
export interface EmployeeWithSkills extends Employee {
  skills: EmployeeSkill[];
  behavioralScore?: BehavioralScore;
}

export interface ProjectWithRequirements extends Project {
  requirements: ProjectRequirement[];
  teamCandidates?: TeamCandidate[];
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: RoleName[];
}
