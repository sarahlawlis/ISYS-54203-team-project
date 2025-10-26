import { type User, type InsertUser, type Attribute, type InsertAttribute, type Workflow, type InsertWorkflow } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import { attributes, workflows } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAttributes(): Promise<Attribute[]>;
  createAttribute(attribute: InsertAttribute): Promise<Attribute>;

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAttributes(): Promise<Attribute[]> {
    const result = await db.select().from(attributes);
    return result;
  }

  async createAttribute(attribute: InsertAttribute): Promise<Attribute> {
    const [newAttribute] = await db.insert(schema.attributes).values(attribute).returning();
    return newAttribute;
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
}

export const storage = new MemStorage();