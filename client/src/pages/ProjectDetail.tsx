import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Edit, Calendar, Users } from "lucide-react";
import { Link } from "wouter";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import type { Project, Form, Workflow, ProjectWorkflow } from "@shared/schema";

interface ProjectDetailResponse extends Project {
  forms: Form[];
  workflows: Workflow[];
  projectWorkflows: ProjectWorkflow[];
}

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: project, isLoading } = useQuery<ProjectDetailResponse>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Link href="/projects">
          <Button variant="outline" data-testid="button-back-to-projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "planning":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "on-hold":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "completed":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "pending":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="outline" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-project-name">
                {project.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Project details and associated resources
              </p>
            </div>
          </div>
          <Button onClick={() => setEditDialogOpen(true)} data-testid="button-edit-project">
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm" data-testid="text-project-description">
                {project.description || "No description provided"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <Badge
                  className={getStatusColor(project.status)}
                  data-testid="badge-project-status"
                >
                  {project.status}
                </Badge>
              </div>
              
              {project.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </h3>
                  <p className="text-sm" data-testid="text-due-date">
                    {new Date(project.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Team Size
                </h3>
                <p className="text-sm" data-testid="text-team-size">
                  {project.teamSize || "0"} members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Forms</CardTitle>
              <CardDescription>
                Forms attached to this project ({project.forms.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.forms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No forms connected</p>
              ) : (
                <div className="space-y-2">
                  {project.forms.map((form) => (
                    <div
                      key={form.id}
                      className="flex items-start gap-3 p-3 rounded-md border hover-elevate"
                      data-testid={`card-form-${form.id}`}
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{form.name}</h4>
                        {form.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflows</CardTitle>
              <CardDescription>
                Workflows associated with this project ({project.workflows.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.workflows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workflows connected</p>
              ) : (
                <div className="space-y-2">
                  {project.workflows.map((workflow) => {
                    const projectWorkflow = project.projectWorkflows.find(
                      pw => pw.workflowId === workflow.id
                    );
                    return (
                      <div
                        key={workflow.id}
                        className="flex items-start gap-3 p-3 rounded-md border hover-elevate"
                        data-testid={`card-workflow-${workflow.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{workflow.name}</h4>
                            {projectWorkflow && (
                              <Badge
                                variant="outline"
                                className={getWorkflowStatusColor(projectWorkflow.status)}
                                data-testid={`badge-workflow-status-${workflow.id}`}
                              >
                                {projectWorkflow.status}
                              </Badge>
                            )}
                          </div>
                          {workflow.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {workflow.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <CreateProjectDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          projectId={projectId}
          initialData={project ? {
            name: project.name,
            description: project.description,
            status: project.status as "planning" | "active" | "on-hold" | "completed",
            teamSize: project.teamSize,
            dueDate: project.dueDate,
            formIds: project.forms.map(f => f.id),
            workflowIds: project.workflows.map(w => w.id),
          } : undefined}
        />
      </div>
    </div>
  );
}
