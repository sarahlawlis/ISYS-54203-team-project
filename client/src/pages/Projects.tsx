import { ProjectCard } from "@/components/ProjectCard";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, User } from "@shared/schema";

type ProjectWithUsers = Project & {
  assignedUsernames: string[];
};

export default function Projects() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("cards");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editProjectData, setEditProjectData] = useState<{
    name: string;
    description: string;
    status: "planning" | "active" | "on-hold" | "completed";
    dueDate: string;
    userIds?: string[];
    formIds?: string[];
    workflowIds?: string[];
  } | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteProjectName, setDeleteProjectName] = useState("");

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const archiveMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}`, { status: "on-hold" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project archived",
        description: "The project has been moved to On Hold status.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setDeleteProjectId(null);
      toast({
        title: "Project deleted",
        description: "The project has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: projectUsersMap = {}, isLoading: isLoadingUsers } = useQuery<Record<string, string[]>>({
    queryKey: ["/api/projects/users-map"],
    queryFn: async () => {
      const map: Record<string, string[]> = {};
      
      await Promise.all(
        projects.map(async (project) => {
          const response = await fetch(`/api/projects/${project.id}/users`);
          if (response.ok) {
            const data = await response.json();
            map[project.id] = data.users?.map((u: User) => u.username) || [];
          } else {
            map[project.id] = [];
          }
        })
      );
      
      return map;
    },
    enabled: projects.length > 0,
  });

  const isLoading = isLoadingProjects || isLoadingUsers;

  const projectsWithUsers = useMemo<ProjectWithUsers[]>(() => {
    return projects.map(project => ({
      ...project,
      assignedUsernames: projectUsersMap[project.id] || [],
    }));
  }, [projects, projectUsersMap]);

  useEffect(() => {
    const stored = localStorage.getItem("projects-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("projects-view", newView);
  };

  const handleEditProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      try {
        const [usersRes, formsRes, workflowsRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/users`),
          fetch(`/api/projects/${projectId}/forms`),
          fetch(`/api/projects/${projectId}/workflows`),
        ]);
        
        if (!usersRes.ok || !formsRes.ok || !workflowsRes.ok) {
          throw new Error("Failed to fetch project data");
        }
        
        const usersData = await usersRes.json();
        const formsData = await formsRes.json();
        const workflowsData = await workflowsRes.json();
        
        const userIds = usersData.users?.map((u: User) => u.id) || [];
        const formIds = formsData.map((f: { formId: string }) => f.formId) || [];
        const workflowIds = workflowsData.map((w: { workflowId: string }) => w.workflowId) || [];
        
        setEditProjectId(projectId);
        setEditProjectData({
          name: project.name,
          description: project.description || "",
          status: project.status as "planning" | "active" | "on-hold" | "completed",
          dueDate: project.dueDate || "",
          userIds,
          formIds,
          workflowIds,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load project data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleArchiveProject = (projectId: string) => {
    archiveMutation.mutate(projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setDeleteProjectId(projectId);
      setDeleteProjectName(project.name);
    }
  };

  const confirmDelete = () => {
    if (deleteProjectId) {
      deleteMutation.mutate(deleteProjectId);
    }
  };

  const filteredProjects = projectsWithUsers.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      
      <CreateProjectDialog 
        open={!!editProjectId} 
        onOpenChange={(open) => {
          if (!open) {
            setEditProjectId(null);
            setEditProjectData(null);
          }
        }}
        projectId={editProjectId || undefined}
        initialData={editProjectData || undefined}
      />

      <AlertDialog open={!!deleteProjectId} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProjectName}"? This action cannot be undone and will permanently remove the project and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
                {projects.length === 0
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
                  assignedUsernames={project.assignedUsernames}
                  activeWorkflows={0}
                  onEdit={handleEditProject}
                  onArchive={handleArchiveProject}
                  onDelete={handleDeleteProject}
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
                assignedUsernames: project.assignedUsernames,
                activeWorkflows: 0,
              }))}
              onEdit={handleEditProject}
              onArchive={handleArchiveProject}
              onDelete={handleDeleteProject}
            />
          )}
        </div>
      </div>
    </>
  );
}
