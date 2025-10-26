import { type User, type InsertUser, type Attribute, type InsertAttribute } from "@shared/schema";
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

  async createAttribute(insertAttribute: InsertAttribute): Promise<Attribute> {
    const result = await db.insert(attributes).values({
      name: insertAttribute.name,
      type: insertAttribute.type,
      description: insertAttribute.description ?? null,
      icon: insertAttribute.icon,
    }).returning();
    
    return result[0];
  }
}

export const storage = new MemStorage();
