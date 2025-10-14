import { ProjectCard } from "@/components/ProjectCard";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";

//todo: remove mock functionality
const mockProjects = [
  {
    id: "1",
    name: "Customer Onboarding System",
    description: "Streamline new customer intake with automated workflows and documentation",
    status: "active" as const,
    dueDate: "Dec 15, 2024",
    teamSize: 5,
    activeWorkflows: 3,
  },
  {
    id: "2",
    name: "Product Launch Campaign",
    description: "Marketing workflow for Q1 product release and promotion",
    status: "planning" as const,
    dueDate: "Jan 20, 2025",
    teamSize: 8,
    activeWorkflows: 2,
  },
  {
    id: "3",
    name: "Employee Training Portal",
    description: "Onboarding and continuous learning platform for team members",
    status: "active" as const,
    dueDate: "Dec 30, 2024",
    teamSize: 4,
    activeWorkflows: 5,
  },
  {
    id: "4",
    name: "Vendor Management System",
    description: "Track and manage vendor relationships and contracts",
    status: "on-hold" as const,
    dueDate: "Feb 10, 2025",
    teamSize: 3,
    activeWorkflows: 1,
  },
  {
    id: "5",
    name: "Website Redesign",
    description: "Complete overhaul of company website with new branding",
    status: "completed" as const,
    dueDate: "Nov 30, 2024",
    teamSize: 6,
    activeWorkflows: 0,
  },
  {
    id: "6",
    name: "Mobile App Development",
    description: "Native mobile application for customer engagement",
    status: "active" as const,
    dueDate: "Mar 15, 2025",
    teamSize: 7,
    activeWorkflows: 4,
  },
];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("cards");

  useEffect(() => {
    const stored = localStorage.getItem("projects-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("projects-view", newView);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your projects in one place
            </p>
          </div>
          <Button data-testid="button-create-project">
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

        {view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        ) : (
          <ProjectsTable projects={mockProjects} />
        )}
      </div>
    </div>
  );
}
