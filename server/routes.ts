import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAttributeSchema, insertFormSchema, insertWorkflowSchema, insertProjectSchema, 
  insertProjectFormSchema, insertProjectWorkflowSchema, insertFormSubmissionSchema,
  insertUserSchema, loginUserSchema, insertUserProjectSchema
} from "@shared/schema";

// Middleware to check authentication
async function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = await storage.getSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const user = await storage.getUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  (req as any).user = user;
  next();
}

// Middleware to check if user is admin
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser(validatedData);
      const session = await storage.createSession(user.id);
      
      res.status(201).json({ 
        user: { ...user, password: undefined },
        token: session.token
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await storage.authenticateUser(validatedData);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const session = await storage.createSession(user.id);
      
      res.json({ 
        user: { ...user, password: undefined },
        token: session.token
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", authenticateRequest, async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await storage.deleteSession(token);
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  app.get("/api/auth/me", authenticateRequest, async (req, res) => {
    const user = (req as any).user;
    res.json({ ...user, password: undefined });
  });

  // User management routes (admin only)
  app.get("/api/users", authenticateRequest, requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getUsers();
      res.json(allUsers.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", authenticateRequest, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Users can view their own profile, admins can view any profile
      if (currentUser.role !== 'admin' && currentUser.id !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", authenticateRequest, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", authenticateRequest, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Users can update their own profile, admins can update any profile
      if (currentUser.role !== 'admin' && currentUser.id !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only admins can change roles
      if (req.body.role && currentUser.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can change user roles" });
      }

      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, validatedData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", authenticateRequest, requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // User-Project assignment routes
  app.get("/api/users/:userId/projects", authenticateRequest, async (req, res) => {
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

  app.get("/api/projects/:projectId/users", authenticateRequest, async (req, res) => {
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

  app.post("/api/projects/:projectId/users", authenticateRequest, async (req, res) => {
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

  app.delete("/api/projects/:projectId/users/:userId", authenticateRequest, async (req, res) => {
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
  // Attributes routes (require authentication)
  app.get("/api/attributes", authenticateRequest, async (_req, res) => {
    try {
      const attributes = await storage.getAttributes();
      res.json(attributes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attributes" });
    }
  });

  // Get a single attribute by ID
  app.get("/api/attributes/:id", async (req, res) => {
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

  app.post("/api/attributes", async (req, res) => {
    try {
      const validatedData = insertAttributeSchema.parse(req.body);
      const attribute = await storage.createAttribute(validatedData);
      res.status(201).json(attribute);
    } catch (error) {
      res.status(400).json({ error: "Invalid attribute data" });
    }
  });

  // Update an attribute
  app.put("/api/attributes/:id", async (req, res) => {
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
  app.get("/api/forms", async (_req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
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

  app.post("/api/forms", async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.put("/api/forms/:id", async (req, res) => {
    try {
      const validatedData = insertFormSchema.partial().parse(req.body);
      const form = await storage.updateForm(req.params.id, validatedData);
      res.json(form);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    try {
      await storage.deleteForm(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete form" });
    }
  });

  // Workflows routes
  app.get("/api/workflows", async (_req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
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

  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.put("/api/workflows/:id", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(req.params.id, validatedData);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid workflow data" });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      await storage.deleteWorkflow(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
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

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { formIds, workflowIds, ...projectData } = req.body;
      const validatedData = insertProjectSchema.partial().parse(projectData);
      const project = await storage.updateProject(req.params.id, validatedData);

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

      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Project Forms routes
  app.get("/api/projects/:id/forms", async (req, res) => {
    try {
      const projectForms = await storage.getProjectForms(req.params.id);
      res.json(projectForms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project forms" });
    }
  });

  app.post("/api/projects/:id/forms", async (req, res) => {
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

  app.delete("/api/projects/:projectId/forms/:formId", async (req, res) => {
    try {
      await storage.removeProjectForm(req.params.projectId, req.params.formId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove project form" });
    }
  });

  // Project Workflows routes
  app.get("/api/projects/:id/workflows", async (req, res) => {
    try {
      const projectWorkflows = await storage.getProjectWorkflows(req.params.id);
      res.json(projectWorkflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project workflows" });
    }
  });

  app.post("/api/projects/:id/workflows", async (req, res) => {
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

  app.put("/api/projects/:projectId/workflows/:workflowId", async (req, res) => {
    try {
      const validatedData = insertProjectWorkflowSchema.partial().parse(req.body);
      const projectWorkflow = await storage.updateProjectWorkflow(req.params.workflowId, validatedData);
      res.json(projectWorkflow);
    } catch (error) {
      res.status(400).json({ error: "Invalid project workflow data" });
    }
  });

  app.delete("/api/projects/:projectId/workflows/:workflowId", async (req, res) => {
    try {
      await storage.removeProjectWorkflow(req.params.workflowId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove project workflow" });
    }
  });

  // Form Submissions routes
  app.get("/api/form-submissions", async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const submissions = await storage.getFormSubmissions(projectId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form submissions" });
    }
  });

  app.post("/api/form-submissions", async (req, res) => {
    try {
      const validatedData = insertFormSubmissionSchema.parse(req.body);
      const submission = await storage.createFormSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ error: "Invalid form submission data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}