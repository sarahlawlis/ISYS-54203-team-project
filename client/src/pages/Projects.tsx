import { ProjectCard } from "@/components/ProjectCard";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectWorkflow, ProjectMember } from "@shared/schema";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("cards");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: allWorkflows = [], isLoading: workflowsLoading } = useQuery<ProjectWorkflow[]>({
    queryKey: ["/api/project-workflows/all"],
  });

  const { data: allMembers = [], isLoading: membersLoading } = useQuery<ProjectMember[]>({
    queryKey: ["/api/project-members/all"],
  });

  const isLoading = projectsLoading || workflowsLoading || membersLoading;

  const projectsWithCounts = projects.map((project) => {
    const workflows = allWorkflows.filter(w => w.projectId === project.id);
    const members = allMembers.filter(m => m.projectId === project.id);
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === "running").length;

    return {
      ...project,
      activeWorkflows,
      totalWorkflows,
      teamSize: members.length,
    };
  });

  useEffect(() => {
    const stored = localStorage.getItem("projects-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("projects-view", newView);
  };

  const filteredProjects = projectsWithCounts.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    },
  });

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  return (
    <>
      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <EditProjectDialog 
        project={selectedProject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      
      <div className="h-full overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage all your projects in one place
              </p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              data-testid="button-create-project"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-projects"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <ViewToggle view={view} onViewChange={handleViewChange} />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {projectsWithCounts.length === 0
                  ? "No projects yet. Create your first project to get started."
                  : "No projects match your search criteria."}
              </p>
            </div>
          ) : view === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description || ""}
                  status={project.status as "active" | "planning" | "on-hold" | "completed"}
                  dueDate={project.dueDate || ""}
                  teamSize={project.teamSize}
                  activeWorkflows={project.activeWorkflows}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          ) : (
            <ProjectsTable
              projects={filteredProjects.map((project) => ({
                id: project.id,
                name: project.name,
                description: project.description || "",
                status: project.status as "active" | "planning" | "on-hold" | "completed",
                dueDate: project.dueDate || "",
                teamSize: project.teamSize,
                activeWorkflows: project.activeWorkflows,
                onEdit: () => handleEditProject(project),
                onDelete: () => handleDeleteProject(project.id),
              }))}
            />
          )}
        </div>
      </div>
    </>
  );
}
