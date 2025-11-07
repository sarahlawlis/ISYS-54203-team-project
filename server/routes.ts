import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttributeSchema, insertFormSchema, insertWorkflowSchema, insertProjectSchema, insertProjectFormSchema, insertProjectWorkflowSchema, insertFormSubmissionSchema, insertUserSchema, loginUserSchema } from "@shared/schema";
import { hashPassword, verifyPassword, sanitizeUser, isAdmin } from "./auth";
import { requirePermission, requireRole, canModifyProject } from "./permissions";
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
      const attribute = await storage.createAttribute(validatedData);
      res.status(201).json(attribute);
    } catch (error) {
      res.status(400).json({ error: "Invalid attribute data" });
    }
  });

  // Update an attribute
  app.put("/api/attributes/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAttributeSchema.parse(req.body);
      const attribute = await storage.updateAttribute(req.params.id, validatedData);
      if (!attribute) {
        return res.status(404).json({ error: "Attribute not found" });
      }
      res.json(attribute);
    } catch (error) {
      res.status(400).json({ error: "Invalid attribute data" });
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

      const { formIds, workflowIds, ...projectData } = req.body;
      const validatedData = insertProjectSchema.partial().parse(projectData);
      const updatedProject = await storage.updateProject(req.params.id, validatedData);

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

  // User-Project assignment routes
  app.get("/api/users/:userId/projects", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;

      // Users can view their own projects, admins can view any user's projects
      if (currentUser.role !== 'admin' && currentUser.id !== req.params.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const userProjects = await storage.getUserProjects(req.params.userId);
      res.json(userProjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user projects" });
    }
  });

  app.get("/api/projects/:projectId/users", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;

      // Check if user has access to this project
      const access = await storage.checkUserProjectAccess(currentUser.id, req.params.projectId);
      if (!access && currentUser.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      const projectUsers = await storage.getProjectUsers(req.params.projectId);
      res.json(projectUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project users" });
    }
  });

  app.post("/api/projects/:projectId/users", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;

      // Check if user has owner/editor access or is admin
      const access = await storage.checkUserProjectAccess(currentUser.id, req.params.projectId);
      if ((!access || (access.role !== 'owner' && access.role !== 'editor')) && currentUser.role !== 'admin') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const validatedData = insertUserProjectSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });

      const userProject = await storage.addUserToProject(validatedData);
      res.status(201).json(userProject);
    } catch (error) {
      res.status(400).json({ error: "Invalid project user data" });
    }
  });

  app.delete("/api/projects/:projectId/users/:userId", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;

      // Check if user has owner access or is admin
      const access = await storage.checkUserProjectAccess(currentUser.id, req.params.projectId);
      if ((!access || access.role !== 'owner') && currentUser.role !== 'admin') {
        return res.status(403).json({ error: "Only project owners can remove users" });
      }

      await storage.removeUserFromProject(req.params.userId, req.params.projectId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove user from project" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}