import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('user'), // 'admin' or 'user'
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

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
