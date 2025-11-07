import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with Replit Auth fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Roles table for role-based access control
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").notNull().default('[]'), // JSON array of permission strings
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// User role assignments
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roleId: varchar("role_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  assignedAt: true,
});

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

export const attributes = pgTable("attributes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
});

export const insertAttributeSchema = createInsertSchema(attributes).omit({
  id: true,
});

export type InsertAttribute = z.infer<typeof insertAttributeSchema>;
export type Attribute = typeof attributes.$inferSelect;

export const forms = pgTable("forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default('project'),
  attributeCount: text("attribute_count").notNull().default('0'),
  usageCount: text("usage_count").notNull().default('0'),
  attributes: text("attributes").notNull().default('[]'), // JSON string of attributes
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
});

export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;

export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  nodes: text("nodes").notNull().default('[]'), // JSON string of workflow nodes
  edges: text("edges").notNull().default('[]'), // JSON string of workflow connections
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('planning'),
  ownerId: varchar("owner_id"), // User who created/owns the project
  dueDate: text("due_date"),
  teamSize: text("team_size").notNull().default('0'),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(['planning', 'active', 'on-hold', 'completed']).default('planning'),
  ownerId: z.string().optional(),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const projectForms = pgTable("project_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  formId: varchar("form_id").notNull(),
  assignedAt: text("assigned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertProjectFormSchema = createInsertSchema(projectForms).omit({
  id: true,
  assignedAt: true,
});

export type InsertProjectForm = z.infer<typeof insertProjectFormSchema>;
export type ProjectForm = typeof projectForms.$inferSelect;

export const projectWorkflows = pgTable("project_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  workflowId: varchar("workflow_id").notNull(),
  status: text("status").notNull().default('pending'),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertProjectWorkflowSchema = createInsertSchema(projectWorkflows).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
});

export type InsertProjectWorkflow = z.infer<typeof insertProjectWorkflowSchema>;
export type ProjectWorkflow = typeof projectWorkflows.$inferSelect;

export const formSubmissions = pgTable("form_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull(),
  projectId: varchar("project_id"),
  projectWorkflowId: varchar("project_workflow_id"),
  submittedBy: varchar("submitted_by"),
  data: text("data").notNull().default('{}'),
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
  submittedAt: true,
});

export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;

// Project members for team assignments and access control
export const projectMembers = pgTable("project_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default('member'), // owner, manager, member, viewer
  accessLevel: text("access_level").notNull().default('standard'), // full, standard, limited
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers).omit({
  id: true,
  assignedAt: true,
}).extend({
  role: z.enum(['owner', 'manager', 'member', 'viewer']).default('member'),
  accessLevel: z.enum(['full', 'standard', 'limited']).default('standard'),
});

export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;
export type ProjectMember = typeof projectMembers.$inferSelect;

// Tasks within workflows for assignment tracking
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  projectWorkflowId: varchar("project_workflow_id"),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('pending'),
  priority: text("priority").notNull().default('medium'),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Task assignments for individual responsibility
export const taskAssignments = pgTable("task_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(),
  userId: varchar("user_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const insertTaskAssignmentSchema = createInsertSchema(taskAssignments).omit({
  id: true,
  assignedAt: true,
});

export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;
export type TaskAssignment = typeof taskAssignments.$inferSelect;
