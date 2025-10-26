import { type User, type InsertUser, type Attribute, type InsertAttribute } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import { attributes } from "@shared/schema";

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
}

export const storage = new MemStorage();