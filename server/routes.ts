import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttributeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Attributes routes
  app.get("/api/attributes", async (_req, res) => {
    try {
      const attributes = await storage.getAttributes();
      res.json(attributes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attributes" });
    }
  });

  app.post("/api/attributes", async (req, res) => {
    try {
      const validatedData = insertAttributeSchema.parse(req.body);
      const attribute = await storage.createAttribute(validatedData);
      res.status(201).json(attribute);
    } catch (error) {
      res.status(400).json({ error: "Invalid attribute data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
