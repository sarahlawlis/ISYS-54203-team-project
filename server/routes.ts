import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttributeSchema, insertFormSchema, insertWorkflowSchema, insertProjectSchema, insertProjectUserSchema, insertProjectFormSchema, insertProjectWorkflowSchema, insertFormSubmissionSchema, insertUserSchema, loginUserSchema, insertSavedSearchSchema } from "@shared/schema";
import { hashPassword, verifyPassword, sanitizeUser, isAdmin } from "./auth";
import { requirePermission, requireRole, canModifyProject } from "./permissions";
import { generateAttributeEmbedding, findSimilarAttributes, serializeEmbedding, isAIConfigured } from "./ai-service";
import "./types";

// Middleware to check if user is authenticated and attach user to request
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  
  if (user.isActive === 'false') {
    return res.status(403).json({ error: "Account is deactivated" });
  }
  
  req.user = user;
  next();
}

// Middleware to check if user is admin
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!isAdmin(user)) {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  req.user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      res.status(201).json(sanitizeUser(user));
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);

      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.isActive === 'false') {
        return res.status(403).json({ error: "Account is deactivated" });
      }

      const isValid = await verifyPassword(validatedData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await storage.updateUserLastLogin(user.id);

      req.session.userId = user.id;
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(sanitizeUser(user));
  });

  app.put("/api/auth/password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  // User management routes (admin only)
  app.get("/api/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(sanitizeUser));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id/role", requireAdmin, async (req, res) => {
    try {
      if (req.session.userId === req.params.id) {
        return res.status(403).json({ error: "You cannot change your own role" });
      }

      const { role } = req.body;
      if (role !== 'admin' && role !== 'user' && role !== 'viewer') {
        return res.status(400).json({ error: "Invalid role" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (targetUser.role === 'admin' && role === 'user') {
        const adminCount = await storage.countAdmins();
        if (adminCount <= 1) {
          return res.status(403).json({ error: "Cannot demote the last active admin" });
        }
      }

      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const performedBy = await storage.getUser(req.session.userId!);
      await storage.createAuditLog({
        action: 'ROLE_CHANGE',
        targetUserId: user.id,
        targetUsername: user.username,
        performedBy: req.session.userId!,
        performedByUsername: performedBy!.username,
        details: `Role changed from ${targetUser.role} to ${role}`,
      });

      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        createdBy: req.session.userId,
      });

      const performedBy = await storage.getUser(req.session.userId!);
      await storage.createAuditLog({
        action: 'USER_CREATED',
        targetUserId: user.id,
        targetUsername: user.username,
        performedBy: req.session.userId!,
        performedByUsername: performedBy!.username,
        details: `Created user with role: ${user.role}`,
      });

      res.status(201).json(sanitizeUser(user));
    } catch (error: any) {
      if (error.errors) {
        const messages = error.errors.map((e: any) => e.message).join(", ");
        return res.status(400).json({ error: messages });
      }
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.put("/api/users/:id/active", requireAdmin, async (req, res) => {
    try {
      if (req.session.userId === req.params.id) {
        return res.status(403).json({ error: "You cannot change your own account status" });
      }

      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (targetUser.role === 'admin' && targetUser.isActive === 'true' && !isActive) {
        const adminCount = await storage.countAdmins();
        if (adminCount <= 1) {
          return res.status(403).json({ error: "Cannot deactivate the last active admin" });
        }
      }

      const user = await storage.updateUserActiveStatus(req.params.id, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const performedBy = await storage.getUser(req.session.userId!);
      await storage.createAuditLog({
        action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        targetUserId: user.id,
        targetUsername: user.username,
        performedBy: req.session.userId!,
        performedByUsername: performedBy!.username,
        details: `Account ${isActive ? 'activated' : 'deactivated'}`,
      });

      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.post("/api/users/:id/reset-password", requireAdmin, async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(req.params.id, hashedPassword);

      const performedBy = await storage.getUser(req.session.userId!);
      await storage.createAuditLog({
        action: 'PASSWORD_RESET',
        targetUserId: targetUser.id,
        targetUsername: targetUser.username,
        performedBy: req.session.userId!,
        performedByUsername: performedBy!.username,
        details: 'Password reset by administrator',
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/audit-logs", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Attributes routes
  app.get("/api/attributes", requireAuth, async (_req, res) => {
    try {
      const attributes = await storage.getAttributes();
      res.json(attributes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attributes" });
    }
  });

  // Get a single attribute by ID
  app.get("/api/attributes/:id", requireAuth, async (req, res) => {
    try {
      const attribute = await storage.getAttributeById(req.params.id);
      if (!attribute) {
        return res.status(404).json({ error: "Attribute not found" });
      }
      res.json(attribute);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attribute" });
    }
  });

  app.post("/api/attributes", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAttributeSchema.parse(req.body);

      // Generate embedding if AI is configured
      let attributeData = { ...validatedData };
      if (isAIConfigured()) {
        try {
          const embedding = await generateAttributeEmbedding(
            validatedData.name,
            validatedData.type,
            validatedData.description
          );
          attributeData.embedding = serializeEmbedding(embedding);
          attributeData.embeddingUpdatedAt = new Date().toISOString();
        } catch (error) {
          console.error("Error generating embedding:", error);
          // Continue without embedding if generation fails
        }
      }

      const attribute = await storage.createAttribute(attributeData);
      res.status(201).json(attribute);
    } catch (error) {
      res.status(400).json({ error: "Invalid attribute data" });
    }
  });

  // Update an attribute
  app.put("/api/attributes/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAttributeSchema.parse(req.body);

      // Regenerate embedding if AI is configured (name, type, or description changed)
      let attributeData = { ...validatedData };
      if (isAIConfigured()) {
        try {
          const embedding = await generateAttributeEmbedding(
            validatedData.name,
            validatedData.type,
            validatedData.description
          );
          attributeData.embedding = serializeEmbedding(embedding);
          attributeData.embeddingUpdatedAt = new Date().toISOString();
        } catch (error) {
          console.error("Error regenerating embedding:", error);
          // Continue without updating embedding if generation fails
        }
      }

      const attribute = await storage.updateAttribute(req.params.id, attributeData);
      if (!attribute) {
        return res.status(404).json({ error: "Attribute not found" });
      }
      res.json(attribute);
    } catch (error) {
      res.status(400).json({ error: "Invalid attribute data" });
    }
  });

  // Check for similar attributes (AI-powered)
  app.post("/api/attributes/check-similarity", requireAuth, async (req, res) => {
    try {
      // Check if AI is configured
      if (!isAIConfigured()) {
        return res.json([]);
      }

      const { name, type, description } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: "Name and type are required" });
      }

      // Get all existing attributes
      const existingAttributes = await storage.getAttributes();

      // Find similar attributes using AI
      const similarAttributes = await findSimilarAttributes(
        { name, type, description },
        existingAttributes
      );

      // Remove similarity score before sending to frontend (as requested)
      const attributesWithoutScores = similarAttributes.map(({ similarity, ...attr }) => attr);

      res.json(attributesWithoutScores);
    } catch (error) {
      console.error("Error checking attribute similarity:", error);
      // Return empty array on error for graceful degradation
      res.json([]);
    }
  });

  // Forms routes
  app.get("/api/forms", requireAuth, async (_req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  app.get("/api/forms/:id", requireAuth, async (req, res) => {
    try {
      const form = await storage.getFormById(req.params.id);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  app.post("/api/forms", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.put("/api/forms/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertFormSchema.partial().parse(req.body);
      const form = await storage.updateForm(req.params.id, validatedData);
      res.json(form);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.delete("/api/forms/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteForm(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete form" });
    }
  });

  // Workflows routes
  app.get("/api/workflows", requireAuth, async (_req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", requireAuth, async (req, res) => {
    try {
      const workflow = await storage.getWorkflowById(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.put("/api/workflows/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(req.params.id, validatedData);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.delete("/api/workflows/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteWorkflow(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // Projects routes
  app.get("/api/projects", requireAuth, async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const [projectForms, projectWorkflows] = await Promise.all([
        storage.getProjectForms(req.params.id),
        storage.getProjectWorkflows(req.params.id),
      ]);

      const formIds = projectForms.map(pf => pf.formId);
      const forms = await Promise.all(formIds.map(id => storage.getFormById(id)));

      const workflowIds = projectWorkflows.map(pw => pw.workflowId);
      const workflows = await Promise.all(workflowIds.map(id => storage.getWorkflowById(id)));

      res.json({
        ...project,
        forms: forms.filter(f => f !== undefined),
        workflows: workflows.filter(w => w !== undefined),
        projectWorkflows,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role === 'viewer') {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          message: "Viewers cannot create projects",
        });
      }

      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...validatedData,
        ownerId: user.id,
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const project = await storage.getProjectById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!canModifyProject(user, project.ownerId)) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          message: "You can only edit your own projects",
        });
      }

      const { userIds, formIds, workflowIds, ...projectData } = req.body;
      const validatedData = insertProjectSchema.partial().parse(projectData);
      const updatedProject = await storage.updateProject(req.params.id, validatedData);

      if (userIds !== undefined) {
        const existingUsers = await storage.getProjectUsers(req.params.id);
        const existingUserIds = existingUsers.map(pu => pu.userId);

        const usersToAdd = userIds.filter((id: string) => !existingUserIds.includes(id));
        const usersToRemove = existingUserIds.filter(id => !userIds.includes(id));

        await Promise.all([
          ...usersToAdd.map((userId: string) => storage.addProjectUser({ projectId: req.params.id, userId })),
          ...usersToRemove.map((userId: string) => storage.removeProjectUser(req.params.id, userId)),
        ]);
      }

      if (formIds !== undefined) {
        const existingForms = await storage.getProjectForms(req.params.id);
        const existingFormIds = existingForms.map(pf => pf.formId);

        const formsToAdd = formIds.filter((id: string) => !existingFormIds.includes(id));
        const formsToRemove = existingFormIds.filter(id => !formIds.includes(id));

        await Promise.all([
          ...formsToAdd.map((formId: string) => storage.addProjectForm({ projectId: req.params.id, formId })),
          ...formsToRemove.map((formId: string) => storage.removeProjectForm(req.params.id, formId)),
        ]);
      }

      if (workflowIds !== undefined) {
        const existingWorkflows = await storage.getProjectWorkflows(req.params.id);
        const existingWorkflowIds = existingWorkflows.map(pw => pw.workflowId);

        const workflowsToAdd = workflowIds.filter((id: string) => !existingWorkflowIds.includes(id));
        const workflowsToRemove = existingWorkflows.filter(pw => !workflowIds.includes(pw.workflowId));

        await Promise.all([
          ...workflowsToAdd.map((workflowId: string) => 
            storage.addProjectWorkflow({ projectId: req.params.id, workflowId, status: 'pending' })
          ),
          ...workflowsToRemove.map(pw => storage.removeProjectWorkflow(pw.id)),
        ]);
      }

      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const project = await storage.getProjectById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!canModifyProject(user, project.ownerId)) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          message: "You can only delete your own projects",
        });
      }

      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Project Forms routes
  app.get("/api/projects/:id/forms", requireAuth, async (req, res) => {
    try {
      const projectForms = await storage.getProjectForms(req.params.id);
      res.json(projectForms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project forms" });
    }
  });

  app.post("/api/projects/:id/forms", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProjectFormSchema.parse({
        ...req.body,
        projectId: req.params.id,
      });
      const projectForm = await storage.addProjectForm(validatedData);
      res.status(201).json(projectForm);
    } catch (error) {
      res.status(400).json({ error: "Invalid project form data" });
    }
  });

  app.delete("/api/projects/:projectId/forms/:formId", requireAdmin, async (req, res) => {
    try {
      await storage.removeProjectForm(req.params.projectId, req.params.formId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove project form" });
    }
  });

  // Project Workflows routes
  app.get("/api/projects/:id/workflows", requireAuth, async (req, res) => {
    try {
      const projectWorkflows = await storage.getProjectWorkflows(req.params.id);
      res.json(projectWorkflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project workflows" });
    }
  });

  app.post("/api/projects/:id/workflows", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProjectWorkflowSchema.parse({
        ...req.body,
        projectId: req.params.id,
      });
      const projectWorkflow = await storage.addProjectWorkflow(validatedData);
      res.status(201).json(projectWorkflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid project workflow data" });
    }
  });

  app.put("/api/projects/:projectId/workflows/:workflowId", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProjectWorkflowSchema.partial().parse(req.body);
      const projectWorkflow = await storage.updateProjectWorkflow(req.params.workflowId, validatedData);
      res.json(projectWorkflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid project workflow data" });
    }
  });

  app.delete("/api/projects/:projectId/workflows/:workflowId", requireAdmin, async (req, res) => {
    try {
      await storage.removeProjectWorkflow(req.params.workflowId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove project workflow" });
    }
  });

  // Form Submissions routes
  app.get("/api/form-submissions", requireAuth, async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const submissions = await storage.getFormSubmissions(projectId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form submissions" });
    }
  });

  app.post("/api/form-submissions", requireAuth, async (req, res) => {
    try {
      const validatedData = insertFormSubmissionSchema.parse(req.body);
      const submission = await storage.createFormSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ error: "Invalid form submission data" });
    }
  });

  // Project Users routes
  app.get("/api/projects/:projectId/users", requireAuth, async (req, res) => {
    try {
      const projectUsers = await storage.getProjectUsers(req.params.projectId);
      
      const userIds = projectUsers.map(pu => pu.userId);
      const users = await Promise.all(userIds.map(id => storage.getUser(id)));
      
      res.json({
        projectUsers,
        users: users.filter(u => u !== undefined).map(u => {
          const { password, ...sanitized } = u!;
          return sanitized;
        }),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project users" });
    }
  });

  app.post("/api/projects/:projectId/users", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const project = await storage.getProjectById(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!canModifyProject(user, project.ownerId)) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          message: "Only project owners and admins can assign users",
        });
      }

      const validatedData = insertProjectUserSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });

      const projectUser = await storage.addProjectUser(validatedData);
      res.status(201).json(projectUser);
    } catch (error) {
      res.status(400).json({ error: "Invalid project user data" });
    }
  });

  app.delete("/api/projects/:projectId/users/:userId", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const project = await storage.getProjectById(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!canModifyProject(user, project.ownerId)) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          message: "Only project owners and admins can remove users",
        });
      }

      await storage.removeProjectUser(req.params.projectId, req.params.userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove user from project" });
    }
  });

  app.put("/api/projects/:projectId/forms/:formId", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const project = await storage.getProjectById(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!canModifyProject(user, project.ownerId)) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          message: "Only project owners and admins can assign forms to users",
        });
      }

      const projectForms = await storage.getProjectForms(req.params.projectId);
      const projectForm = projectForms.find(pf => pf.formId === req.params.formId);
      
      if (!projectForm) {
        return res.status(404).json({ error: "Form not found in project" });
      }

      const validatedData = insertProjectFormSchema.partial().parse(req.body);
      const updatedProjectForm = await storage.updateProjectForm(projectForm.id, validatedData);
      res.json(updatedProjectForm);
    } catch (error) {
      res.status(400).json({ error: "Invalid form assignment data" });
    }
  });

  // Saved Searches routes
  app.get("/api/saved-searches", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const userId = req.query.userId as string | undefined;
      const allSearches = await storage.getSavedSearches(userId);

      // Filter searches based on visibility permissions
      const filteredSearches = allSearches.filter(search => {
        // User can always see their own searches
        if (search.createdBy === user.id) {
          return true;
        }

        // Admins can see all searches
        if (user.role === 'admin') {
          return true;
        }

        // Public searches visible to all
        if (search.visibility === 'public') {
          return true;
        }

        // Team searches visible to all users (not just viewers)
        if (search.visibility === 'team' && user.role !== 'viewer') {
          return true;
        }

        // Private and Shared searches only visible to owner (shared will be enhanced later)
        return false;
      });

      res.json(filteredSearches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved searches" });
    }
  });

  app.get("/api/saved-searches/:id", requireAuth, async (req, res) => {
    try {
      const search = await storage.getSavedSearchById(req.params.id);
      if (!search) {
        return res.status(404).json({ error: "Saved search not found" });
      }
      res.json(search);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved search" });
    }
  });

  app.post("/api/saved-searches", requireAuth, async (req, res) => {
    try {
      console.log('POST /api/saved-searches - Request body:', req.body);
      console.log('POST /api/saved-searches - Session userId:', req.session.userId);

      const validatedData = insertSavedSearchSchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });

      console.log('POST /api/saved-searches - Validated data:', validatedData);

      const search = await storage.createSavedSearch(validatedData);

      console.log('POST /api/saved-searches - Created search:', search);

      res.status(201).json(search);
    } catch (error) {
      console.error('POST /api/saved-searches - Error:', error);
      res.status(400).json({ error: "Invalid saved search data" });
    }
  });

  app.put("/api/saved-searches/:id", requireAuth, async (req, res) => {
    try {
      const search = await storage.getSavedSearchById(req.params.id);
      if (!search) {
        return res.status(404).json({ error: "Saved search not found" });
      }

      // Only the creator can update their search
      if (search.createdBy !== req.session.userId && !isAdmin(req.user)) {
        return res.status(403).json({ error: "You can only update your own searches" });
      }

      const validatedData = insertSavedSearchSchema.partial().parse(req.body);
      const updatedSearch = await storage.updateSavedSearch(req.params.id, validatedData);
      res.json(updatedSearch);
    } catch (error) {
      res.status(400).json({ error: "Invalid saved search data" });
    }
  });

  app.delete("/api/saved-searches/:id", requireAuth, async (req, res) => {
    try {
      const search = await storage.getSavedSearchById(req.params.id);
      if (!search) {
        return res.status(404).json({ error: "Saved search not found" });
      }

      // Only the creator or admin can delete
      if (search.createdBy !== req.session.userId && !isAdmin(req.user)) {
        return res.status(403).json({ error: "You can only delete your own searches" });
      }

      await storage.deleteSavedSearch(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saved search" });
    }
  });

  // Execute a saved search and return results
  // Helper function to resolve smart values in filter values
  function resolveSmartValue(value: string, userId: string): string | { start: string; end: string } {
    if (!value || !value.startsWith('@')) {
      return value; // Not a smart value, return as-is
    }

    const now = new Date();

    switch (value.toLowerCase()) {
      // User smart values
      case '@me':
        return userId;

      case '@my-team':
        // TODO: Implement team lookup when team feature is available
        // For now, just return the current user
        return userId;

      // Date smart values - return ranges for inclusive filtering
      case '@today': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return {
          start: start.toISOString(),
          end: end.toISOString()
        };
      }

      case '@this-week': {
        // Get start of week (Sunday at 00:00:00)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Get end of week (Saturday at 23:59:59)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return {
          start: startOfWeek.toISOString(),
          end: endOfWeek.toISOString()
        };
      }

      case '@this-month': {
        // Get start of month (1st at 00:00:00)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

        // Get end of month (last day at 23:59:59)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        return {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString()
        };
      }

      case '@this-year': {
        // Get start of year (Jan 1 at 00:00:00)
        const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

        // Get end of year (Dec 31 at 23:59:59)
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

        return {
          start: startOfYear.toISOString(),
          end: endOfYear.toISOString()
        };
      }

      default:
        console.log(`Unknown smart value: ${value}, returning as-is`);
        return value;
    }
  }

  app.get("/api/search/execute/:id", requireAuth, async (req, res) => {
    try {
      const search = await storage.getSavedSearchById(req.params.id);
      if (!search) {
        return res.status(404).json({ error: "Saved search not found" });
      }

      // Parse the filters
      const filters = JSON.parse(search.filters);
      console.log('Executing search with filters:', JSON.stringify(filters, null, 2));

      // Resolve smart values in all filters
      const userId = (req.session as any).userId;
      if (filters.projectFilters) {
        filters.projectFilters = filters.projectFilters.map((filter: any) => {
          // Check smartValue field first (new consolidated UI), then fall back to value field
          const valueToResolve = filter.smartValue || filter.value;
          return {
            ...filter,
            value: typeof valueToResolve === 'string' ? resolveSmartValue(valueToResolve, userId) : valueToResolve
          };
        });
      }
      if (filters.taskFilters) {
        filters.taskFilters = filters.taskFilters.map((filter: any) => {
          const valueToResolve = filter.smartValue || filter.value;
          return {
            ...filter,
            value: typeof valueToResolve === 'string' ? resolveSmartValue(valueToResolve, userId) : valueToResolve
          };
        });
      }
      if (filters.fileFilters) {
        filters.fileFilters = filters.fileFilters.map((filter: any) => {
          const valueToResolve = filter.smartValue || filter.value;
          return {
            ...filter,
            value: typeof valueToResolve === 'string' ? resolveSmartValue(valueToResolve, userId) : valueToResolve
          };
        });
      }
      if (filters.attributeFilters) {
        filters.attributeFilters = filters.attributeFilters.map((filter: any) => {
          const valueToResolve = filter.smartValue || filter.value;
          return {
            ...filter,
            value: typeof valueToResolve === 'string' ? resolveSmartValue(valueToResolve, userId) : valueToResolve
          };
        });
      }

      console.log('Filters after smart value resolution:', JSON.stringify(filters, null, 2));
      const results: any[] = [];

      // Get all projects and filter them
      // Field name mapping from UI field names to database column names
      const fieldMapping: Record<string, string> = {
        'created_by': 'ownerId',
        'last_modified': 'updatedAt',
        'started': 'createdAt',
        'due_date': 'dueDate',
        'team_size': 'teamSize',
      };

      if (filters.projectFilters && filters.projectFilters.length > 0) {
        const projects = await storage.getProjects();
        console.log(`Found ${projects.length} total projects`);
        const matchingProjects = projects.filter(project => {
          return filters.projectFilters.every((filter: any) => {
            // Map field names to actual project properties
            const fieldName = fieldMapping[filter.field] || filter.field;
            const fieldValue = (project as any)[fieldName];
            const filterValue = filter.value;

            // Check if filterValue is a date range object
            const isDateRange = filterValue && typeof filterValue === 'object' && 'start' in filterValue && 'end' in filterValue;

            // Handle date range filtering
            if (isDateRange) {
              const fieldDate = fieldValue ? new Date(fieldValue).getTime() : null;
              if (!fieldDate) return false; // No date value means no match

              const startDate = new Date(filterValue.start).getTime();
              const endDate = new Date(filterValue.end).getTime();

              switch (filter.operator) {
                case 'on':
                case 'equals':
                case 'is':
                  // Check if field date is within the range (inclusive)
                  return fieldDate >= startDate && fieldDate <= endDate;

                case 'before':
                  // Before the start of the range
                  return fieldDate < startDate;

                case 'after':
                  // After the end of the range
                  return fieldDate > endDate;

                case 'between':
                  // Within the range (inclusive)
                  return fieldDate >= startDate && fieldDate <= endDate;

                default:
                  return true;
              }
            }

            // Handle regular string filtering
            const stringValue = filterValue?.trim ? filterValue.trim() : String(filterValue || '');

            switch (filter.operator) {
              case 'contains':
                if (!stringValue) return true;
                return String(fieldValue || '').toLowerCase().includes(stringValue.toLowerCase());

              case 'equals':
              case 'is':
                if (!stringValue) return true;
                return String(fieldValue || '').toLowerCase() === stringValue.toLowerCase();

              case 'not_equals':
              case 'is_not':
                if (!stringValue) return true;
                return String(fieldValue || '').toLowerCase() !== stringValue.toLowerCase();

              case 'not_contains':
                if (!stringValue) return true;
                return !String(fieldValue || '').toLowerCase().includes(stringValue.toLowerCase());

              case 'starts_with':
                if (!stringValue) return true;
                return String(fieldValue || '').toLowerCase().startsWith(stringValue.toLowerCase());

              case 'ends_with':
                if (!stringValue) return true;
                return String(fieldValue || '').toLowerCase().endsWith(stringValue.toLowerCase());

              case 'is_empty':
                return !fieldValue || String(fieldValue).trim() === '';

              case 'is_not_empty':
                return fieldValue && String(fieldValue).trim() !== '';

              default:
                console.log(`Unknown operator: ${filter.operator}, defaulting to true`);
                return true;
            }
          });
        });

        console.log(`Matched ${matchingProjects.length} projects after filtering`);

        // Build metadata from visible fields in the filters
        const resultsWithMetadata = await Promise.all(matchingProjects.map(async (p) => {
          const metadata: Record<string, any> = {};

          // Add all visible fields to metadata
          for (const filter of filters.projectFilters) {
            if (filter.visible && filter.field) {
              let fieldValue: any;

              // Get the actual database field name
              const dbFieldName = fieldMapping[filter.field] || filter.field;

              // Map 'created_by' to owner information
              if (filter.field === 'created_by') {
                // Get the owner user to show their username
                const owner = await storage.getUser(p.ownerId);
                fieldValue = owner?.username || p.ownerId;
              } else {
                fieldValue = (p as any)[dbFieldName];
              }

              metadata[filter.field] = fieldValue;
              console.log(`Adding field ${filter.field} (mapped to ${dbFieldName}) with value:`, fieldValue);
            }
          }

          console.log('Built metadata:', metadata);

          return {
            type: 'project',
            id: p.id,
            name: p.name,
            description: p.description,
            metadata
          };
        }));

        results.push(...resultsWithMetadata);
      }

      // Note: Task and file filtering would be added here when those entities exist
      // For now, we'll just return project results

      console.log(`Returning ${results.length} total results`);
      res.json(results);
    } catch (error) {
      console.error('Error executing search:', error);
      res.status(500).json({ error: "Failed to execute search" });
    }
  });

  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/assigned-forms", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const assignedForms = await storage.getUserAssignedForms(userId);
      res.json(assignedForms);
    } catch (error) {
      console.error('Error fetching assigned forms:', error);
      res.status(500).json({ error: "Failed to fetch assigned forms" });
    }
  });

  app.get("/api/projects/recent", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recentProjects = await storage.getRecentProjects(limit);
      res.json(recentProjects);
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      res.status(500).json({ error: "Failed to fetch recent projects" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
