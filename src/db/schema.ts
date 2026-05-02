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
  real,
  varchar,
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
});

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
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── KiCob Application Tables ───────────────────────────────

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  employeeCode: varchar("employee_code", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  status: text("status").notNull().default("active"), // active | inactive
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(), // hard | soft
});

export const employeeSkills = pgTable("employee_skills", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  skillId: integer("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  level: integer("level").notNull().default(1), // 1-5
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  assessorName: text("assessor_name").notNull(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  assessmentType: text("assessment_type").notNull(), // self | peer | supervisor
  emotionalStability: real("emotional_stability").notNull(),
  communication: real("communication").notNull(),
  teamwork: real("teamwork").notNull(),
  adaptability: real("adaptability").notNull(),
  consistencyScore: real("consistency_score").notNull().default(0),
  period: text("period").notNull().default("Mei 2024"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const behavioralScores = pgTable("behavioral_scores", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  avgEmotionalStability: real("avg_emotional_stability").notNull(),
  avgCommunication: real("avg_communication").notNull(),
  avgTeamwork: real("avg_teamwork").notNull(),
  avgAdaptability: real("avg_adaptability").notNull(),
  finalBehaviorScore: real("final_behavior_score").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  createdBy: text("created_by").references(() => user.id),
  projectName: text("project_name").notNull(),
  description: text("description").notNull().default(""),
  teamSize: integer("team_size").notNull().default(3),
  hardSkillWeight: real("hard_skill_weight").notNull().default(0.6),
  softFactorWeight: real("soft_factor_weight").notNull().default(0.4),
  status: text("status").notNull().default("draft"), // draft | active | completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectRequirements = pgTable("project_requirements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  skillId: integer("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  requiredLevel: integer("required_level").notNull().default(3),
  isMandatory: boolean("is_mandatory").notNull().default(false),
});

export const teamCandidates = pgTable("team_candidates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  totalScore: real("total_score").notNull(),
  ranking: integer("ranking").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamCandidateId: integer("team_candidate_id")
    .notNull()
    .references(() => teamCandidates.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  contributionScore: real("contribution_score").notNull(),
  hardSkillScore: real("hard_skill_score"),
  softFactorScore: real("soft_factor_score"),
});

export const recommendationHistory = pgTable("recommendation_history", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  approvedBy: text("approved_by").references(() => user.id),
  decisionNote: text("decision_note").notNull().default(""),
  status: text("status").notNull().default("pending"), // approved | rejected | adjusted | pending
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
