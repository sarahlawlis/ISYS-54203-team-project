import { type User, type UpsertUser, type Attribute, type InsertAttribute, type Workflow, type InsertWorkflow, type Project, type InsertProject, type ProjectForm, type InsertProjectForm, type ProjectWorkflow, type InsertProjectWorkflow, type FormSubmission, type InsertFormSubmission, type Role, type InsertRole, type ProjectMember, type InsertProjectMember, type Task, type InsertTask, type TaskAssignment, type InsertTaskAssignment } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq, sql as drizzleSql } from "drizzle-orm";
import { db } from "./db";
import { attributes, workflows, projects, projectForms, projectWorkflows, formSubmissions, users, roles, userRoles, projectMembers, tasks, taskAssignments } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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
  getAllProjectWorkflows(): Promise<ProjectWorkflow[]>;
  addProjectWorkflow(projectWorkflow: InsertProjectWorkflow): Promise<ProjectWorkflow>;
  updateProjectWorkflow(id: string, projectWorkflow: Partial<InsertProjectWorkflow>): Promise<ProjectWorkflow>;
  removeProjectWorkflow(id: string): Promise<void>;

  getFormSubmissions(projectId?: string): Promise<FormSubmission[]>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;

  // Role operations
  getRoles(): Promise<Role[]>;
  getRoleById(id: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;

  // User role operations
  getUserRoles(userId: string): Promise<string[]>;
  assignUserRole(userId: string, roleId: string): Promise<void>;

  // Project member operations
  getProjectMembers(projectId: string): Promise<ProjectMember[]>;
  getAllProjectMembers(): Promise<ProjectMember[]>;
  getUserProjects(userId: string): Promise<Project[]>;
  addProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
  removeProjectMember(projectId: string, userId: string): Promise<void>;

  // Task operations
  getTasks(workflowId?: string, projectWorkflowId?: string): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | undefined>;
  getUserTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;

  // Task assignment operations
  getTaskAssignments(taskId: string): Promise<TaskAssignment[]>;
  assignTask(assignment: InsertTaskAssignment): Promise<TaskAssignment>;
  unassignTask(taskId: string, userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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

  async getAllProjectWorkflows(): Promise<ProjectWorkflow[]> {
    return await db.select().from(projectWorkflows);
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

  // Role operations
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async getRoleById(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  // User role operations
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoleRecords = await db.select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return userRoleRecords.map(r => r.roleId);
  }

  async assignUserRole(userId: string, roleId: string): Promise<void> {
    await db.insert(userRoles).values({ userId, roleId });
  }

  // Project member operations
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return await db.select().from(projectMembers).where(eq(projectMembers.projectId, projectId));
  }

  async getAllProjectMembers(): Promise<ProjectMember[]> {
    return await db.select().from(projectMembers);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const memberRecords = await db.select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));
    
    if (memberRecords.length === 0) return [];
    
    const projectIds = memberRecords.map(r => r.projectId);
    return await db.select().from(projects).where(drizzleSql`${projects.id} = ANY(${projectIds})`);
  }

  async addProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const [newMember] = await db.insert(projectMembers).values(member).returning();
    return newMember;
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await db.delete(projectMembers)
      .where(drizzleSql`${projectMembers.projectId} = ${projectId} AND ${projectMembers.userId} = ${userId}`);
  }

  // Task operations
  async getTasks(workflowId?: string, projectWorkflowId?: string): Promise<Task[]> {
    if (workflowId) {
      return await db.select().from(tasks).where(eq(tasks.workflowId, workflowId));
    }
    if (projectWorkflowId) {
      return await db.select().from(tasks).where(eq(tasks.projectWorkflowId, projectWorkflowId));
    }
    return await db.select().from(tasks);
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    const assignmentRecords = await db.select({ taskId: taskAssignments.taskId })
      .from(taskAssignments)
      .where(eq(taskAssignments.userId, userId));
    
    if (assignmentRecords.length === 0) return [];
    
    const taskIds = assignmentRecords.map(r => r.taskId);
    return await db.select().from(tasks).where(drizzleSql`${tasks.id} = ANY(${taskIds})`);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, taskData: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db.update(tasks)
      .set({
        ...taskData,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  // Task assignment operations
  async getTaskAssignments(taskId: string): Promise<TaskAssignment[]> {
    return await db.select().from(taskAssignments).where(eq(taskAssignments.taskId, taskId));
  }

  async assignTask(assignment: InsertTaskAssignment): Promise<TaskAssignment> {
    const [newAssignment] = await db.insert(taskAssignments).values(assignment).returning();
    return newAssignment;
  }

  async unassignTask(taskId: string, userId: string): Promise<void> {
    await db.delete(taskAssignments)
      .where(drizzleSql`${taskAssignments.taskId} = ${taskId} AND ${taskAssignments.userId} = ${userId}`);
  }
}

export const storage = new MemStorage();