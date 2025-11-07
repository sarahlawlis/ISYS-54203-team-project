import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAttributeSchema, insertFormSchema, insertWorkflowSchema, insertProjectSchema, insertProjectFormSchema, insertProjectWorkflowSchema, insertFormSubmissionSchema, insertRoleSchema, insertProjectMemberSchema, insertTaskSchema, insertTaskAssignmentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication with Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Attributes routes (protected)
  app.get("/api/attributes", async (_req, res) => {
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
      res.json(project);
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
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
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
  app.get("/api/project-workflows/all", isAuthenticated, async (req, res) => {
    try {
      const allWorkflows = await storage.getAllProjectWorkflows();
      res.json(allWorkflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all project workflows" });
    }
  });

  app.get("/api/projects/:id/workflows", isAuthenticated, async (req, res) => {
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

  // Roles routes (protected)
  app.get("/api/roles", isAuthenticated, async (_req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.post("/api/roles", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: "Invalid role data" });
    }
  });

  // User routes (protected)
  app.get("/api/users/:id/roles", isAuthenticated, async (req, res) => {
    try {
      const roleIds = await storage.getUserRoles(req.params.id);
      res.json(roleIds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user roles" });
    }
  });

  app.get("/api/users/:id/projects", isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getUserProjects(req.params.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user projects" });
    }
  });

  app.get("/api/users/:id/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getUserTasks(req.params.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user tasks" });
    }
  });

  // Project Members routes (protected)
  app.get("/api/project-members/all", isAuthenticated, async (req, res) => {
    try {
      const allMembers = await storage.getAllProjectMembers();
      res.json(allMembers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all project members" });
    }
  });

  app.get("/api/projects/:id/members", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getProjectMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project members" });
    }
  });

  app.post("/api/projects/:id/members", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectMemberSchema.parse({
        ...req.body,
        projectId: req.params.id,
      });
      const member = await storage.addProjectMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ error: "Invalid project member data" });
    }
  });

  app.delete("/api/projects/:projectId/members/:userId", isAuthenticated, async (req, res) => {
    try {
      await storage.removeProjectMember(req.params.projectId, req.params.userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove project member" });
    }
  });

  // Tasks routes (protected)
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const workflowId = req.query.workflowId as string | undefined;
      const projectWorkflowId = req.query.projectWorkflowId as string | undefined;
      const tasks = await storage.getTasks(workflowId, projectWorkflowId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, validatedData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  // Task Assignments routes (protected)
  app.get("/api/tasks/:id/assignments", isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getTaskAssignments(req.params.id);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task assignments" });
    }
  });

  app.post("/api/tasks/:id/assignments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskAssignmentSchema.parse({
        ...req.body,
        taskId: req.params.id,
      });
      const assignment = await storage.assignTask(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Invalid task assignment data" });
    }
  });

  app.delete("/api/tasks/:taskId/assignments/:userId", isAuthenticated, async (req, res) => {
    try {
      await storage.unassignTask(req.params.taskId, req.params.userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove task assignment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}