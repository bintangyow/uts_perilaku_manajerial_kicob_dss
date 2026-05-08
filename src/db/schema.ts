// ============================================================
// KiCob — Drizzle ORM Schema (PostgreSQL / Supabase)
// ============================================================

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  varchar,
  unique,
  index,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

// ─── Better Auth Managed Tables ─────────────────────────────
// These are required by Better Auth and will be auto-managed.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role").notNull().default("reviewer"), // admin | manager | hr | reviewer
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}, (t) => [
  index("session_user_id_idx").on(t.userId),
]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("account_user_id_idx").on(t.userId),
]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── KiCob Application Tables ───────────────────────────────

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references((): AnyPgColumn => departments.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  jobLevel: integer("job_level").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assessmentPeriods = pgTable("assessment_periods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Mei 2026"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"), // active | closed | locked
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  employeeCode: varchar("employee_code", { length: 20 }).notNull().unique(),
  departmentId: integer("department_id").references(() => departments.id),
  positionId: integer("position_id").references(() => positions.id),
  supervisorId: integer("supervisor_id").references((): AnyPgColumn => employees.id),
  jobLevel: integer("job_level").notNull().default(1), // 1: Staff, 2: Supervisor, 3: Manager, 4: Director
  status: text("status").notNull().default("active"), // active | inactive
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("employees_user_id_idx").on(t.userId),
  index("employees_dept_id_idx").on(t.departmentId),
  index("employees_pos_id_idx").on(t.positionId),
  index("employees_supervisor_id_idx").on(t.supervisorId),
]);

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(), // hard | soft
});

export const employeeSkills = pgTable(
  "employee_skills",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    skillId: integer("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    level: integer("level").notNull().default(1), // 1-5
  },
  (t) => [unique("unique_employee_skill").on(t.employeeId, t.skillId)]
);

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  assessorName: text("assessor_name").notNull(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  assessmentType: text("assessment_type").notNull(), // self | peer | supervisor
  emotionalStability: numeric("emotional_stability", { precision: 5, scale: 2 }).notNull(),
  communication: numeric("communication", { precision: 5, scale: 2 }).notNull(),
  teamwork: numeric("teamwork", { precision: 5, scale: 2 }).notNull(),
  adaptability: numeric("adaptability", { precision: 5, scale: 2 }).notNull(),
  consistencyScore: numeric("consistency_score", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  periodId: integer("period_id").references(() => assessmentPeriods.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("assessments_employee_id_idx").on(t.employeeId),
  index("assessments_period_id_idx").on(t.periodId),
]);

export const behavioralScores = pgTable("behavioral_scores", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  avgEmotionalStability: numeric("avg_emotional_stability", { precision: 5, scale: 2 }).notNull(),
  avgCommunication: numeric("avg_communication", { precision: 5, scale: 2 }).notNull(),
  avgTeamwork: numeric("avg_teamwork", { precision: 5, scale: 2 }).notNull(),
  avgAdaptability: numeric("avg_adaptability", { precision: 5, scale: 2 }).notNull(),
  finalBehaviorScore: numeric("final_behavior_score", { precision: 5, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("behavioral_scores_employee_id_idx").on(t.employeeId),
]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  projectName: text("project_name").notNull(),
  description: text("description").notNull().default(""),
  teamSize: integer("team_size").notNull().default(3),
  hardSkillWeight: numeric("hard_skill_weight", { precision: 3, scale: 2 })
    .notNull()
    .default("0.60"),
  softFactorWeight: numeric("soft_factor_weight", { precision: 3, scale: 2 })
    .notNull()
    .default("0.40"),
  status: text("status").notNull().default("draft"), // draft | active | completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("projects_created_by_idx").on(t.createdBy),
]);

export const projectRequirements = pgTable(
  "project_requirements",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    skillId: integer("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    requiredLevel: integer("required_level").notNull().default(3),
    isMandatory: boolean("is_mandatory").notNull().default(false),
  },
  (t) => [
    unique("unique_project_requirement").on(t.projectId, t.skillId),
    index("project_reqs_skill_id_idx").on(t.skillId),
  ]
);

export const teamCandidates = pgTable("team_candidates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  totalScore: numeric("total_score", { precision: 5, scale: 2 }).notNull(),
  ranking: integer("ranking").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
}, (t) => [
  index("team_candidates_project_id_idx").on(t.projectId),
]);

export const teamMembers = pgTable(
  "team_members",
  {
    id: serial("id").primaryKey(),
    teamCandidateId: integer("team_candidate_id")
      .notNull()
      .references(() => teamCandidates.id, { onDelete: "cascade" }),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    contributionScore: numeric("contribution_score", { precision: 5, scale: 2 }).notNull(),
    hardSkillScore: numeric("hard_skill_score", { precision: 5, scale: 2 }),
    softFactorScore: numeric("soft_factor_score", { precision: 5, scale: 2 }),
  },
  (t) => [
    unique("unique_team_candidate_member").on(t.teamCandidateId, t.employeeId),
    index("team_members_employee_id_idx").on(t.employeeId),
  ]
);

export const recommendationHistory = pgTable("recommendation_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  approvedBy: text("approved_by").references(() => user.id, { onDelete: "set null" }),
  decisionNote: text("decision_note").notNull().default(""),
  status: text("status").notNull().default("pending"), // approved | rejected | adjusted | pending
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("rec_history_project_id_idx").on(t.projectId),
  index("rec_history_approved_by_idx").on(t.approvedBy),
]);
