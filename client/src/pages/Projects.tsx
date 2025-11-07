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
import { Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("cards");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("projects-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("projects-view", newView);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      
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
                  teamSize={parseInt(project.teamSize) || 0}
                  activeWorkflows={0}
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
                teamSize: parseInt(project.teamSize) || 0,
                activeWorkflows: 0,
              }))}
            />
          )}
        </div>
      </div>
    </>
  );
}
