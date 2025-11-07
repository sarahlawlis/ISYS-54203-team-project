import { type User, type InsertUser, type Attribute, type InsertAttribute, type Workflow, type InsertWorkflow, type Project, type InsertProject, type ProjectForm, type InsertProjectForm, type ProjectWorkflow, type InsertProjectWorkflow, type FormSubmission, type InsertFormSubmission } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq, sql as drizzleSql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import { attributes, workflows, projects, projectForms, projectWorkflows, formSubmissions } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;

  getAttributes(): Promise<Attribute[]>;
  getAttributeById(id: string): Promise<Attribute | undefined>;
  createAttribute(attribute: InsertAttribute): Promise<Attribute>;
  updateAttribute(id: string, attribute: InsertAttribute): Promise<Attribute | undefined>;

  getForms(): Promise<schema.Form[]>;
  getFormById(id: string): Promise<schema.Form | undefined>;
  createForm(form: schema.InsertForm): Promise<schema.Form>;
  updateForm(id: string, form: Partial<schema.InsertForm>): Promise<schema.Form>;
  deleteForm(id: string): Promise<void>;

  getWorkflows(): Promise<Workflow[]>;
  getWorkflowById(id: string): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, workflow: Partial<InsertWorkflow>): Promise<Workflow>;
  deleteWorkflow(id: string): Promise<void>;

  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  getProjectForms(projectId: string): Promise<ProjectForm[]>;
  addProjectForm(projectForm: InsertProjectForm): Promise<ProjectForm>;
  removeProjectForm(projectId: string, formId: string): Promise<void>;

  getProjectWorkflows(projectId: string): Promise<ProjectWorkflow[]>;
  addProjectWorkflow(projectWorkflow: InsertProjectWorkflow): Promise<ProjectWorkflow>;
  updateProjectWorkflow(id: string, projectWorkflow: Partial<InsertProjectWorkflow>): Promise<ProjectWorkflow>;
  removeProjectWorkflow(id: string): Promise<void>;

  getFormSubmissions(projectId?: string): Promise<FormSubmission[]>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, role };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAttributes(): Promise<Attribute[]> {
    return await db.select().from(attributes);
  }

  async getAttributeById(id: string): Promise<Attribute | undefined> {
    const result = await db.select().from(attributes).where(eq(attributes.id, id));
    return result[0];
  }

  async createAttribute(data: InsertAttribute): Promise<Attribute> {
    const [newAttribute] = await db.insert(schema.attributes).values(data).returning();
    return newAttribute;
  }

  async updateAttribute(id: string, data: InsertAttribute): Promise<Attribute | undefined> {
    const result = await db
      .update(attributes)
      .set(data)
      .where(eq(attributes.id, id))
      .returning();
    return result[0];
  }

  async getForms(): Promise<schema.Form[]> {
    return await db.select().from(schema.forms);
  }

  async getFormById(id: string): Promise<schema.Form | undefined> {
    const [form] = await db.select().from(schema.forms).where(eq(schema.forms.id, id));
    return form;
  }

  async createForm(form: schema.InsertForm): Promise<schema.Form> {
    const [newForm] = await db.insert(schema.forms).values(form).returning();
    return newForm;
  }

  async updateForm(id: string, form: Partial<schema.InsertForm>): Promise<schema.Form> {
    const [updatedForm] = await db.update(schema.forms)
      .set(form)
      .where(eq(schema.forms.id, id))
      .returning();
    return updatedForm;
  }

  async deleteForm(id: string): Promise<void> {
    await db.delete(schema.forms).where(eq(schema.forms.id, id));
  }

  async getWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows);
  }

  async getWorkflowById(id: string): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db.insert(workflows).values(workflow).returning();
    return newWorkflow;
  }

  async updateWorkflow(id: string, workflow: Partial<InsertWorkflow>): Promise<Workflow> {
    const [updatedWorkflow] = await db.update(workflows)
      .set(workflow)
      .where(eq(workflows.id, id))
      .returning();
    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await db.delete(workflows).where(eq(workflows.id, id));
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db.update(projects)
      .set({
        ...project,
        updatedAt: drizzleSql`CURRENT_TIMESTAMP`,
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projectForms).where(eq(projectForms.projectId, id));
    await db.delete(projectWorkflows).where(eq(projectWorkflows.projectId, id));
    await db.delete(formSubmissions).where(eq(formSubmissions.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getProjectForms(projectId: string): Promise<ProjectForm[]> {
    return await db.select().from(projectForms).where(eq(projectForms.projectId, projectId));
  }

  async addProjectForm(projectForm: InsertProjectForm): Promise<ProjectForm> {
    const [newProjectForm] = await db.insert(projectForms).values(projectForm).returning();
    return newProjectForm;
  }

  async removeProjectForm(projectId: string, formId: string): Promise<void> {
    await db.delete(projectForms)
      .where(drizzleSql`${projectForms.projectId} = ${projectId} AND ${projectForms.formId} = ${formId}`);
  }

  async getProjectWorkflows(projectId: string): Promise<ProjectWorkflow[]> {
    return await db.select().from(projectWorkflows).where(eq(projectWorkflows.projectId, projectId));
  }

  async addProjectWorkflow(projectWorkflow: InsertProjectWorkflow): Promise<ProjectWorkflow> {
    const [newProjectWorkflow] = await db.insert(projectWorkflows).values(projectWorkflow).returning();
    return newProjectWorkflow;
  }

  async updateProjectWorkflow(id: string, projectWorkflow: Partial<InsertProjectWorkflow>): Promise<ProjectWorkflow> {
    const [updatedProjectWorkflow] = await db.update(projectWorkflows)
      .set(projectWorkflow)
      .where(eq(projectWorkflows.id, id))
      .returning();
    return updatedProjectWorkflow;
  }

  async removeProjectWorkflow(id: string): Promise<void> {
    await db.delete(projectWorkflows).where(eq(projectWorkflows.id, id));
  }

  async getFormSubmissions(projectId?: string): Promise<FormSubmission[]> {
    if (projectId) {
      return await db.select().from(formSubmissions).where(eq(formSubmissions.projectId, projectId));
    }
    return await db.select().from(formSubmissions);
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const [newSubmission] = await db.insert(formSubmissions).values(submission).returning();
    return newSubmission;
  }
}

export const storage = new MemStorage();