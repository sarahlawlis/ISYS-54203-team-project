import { StatsCard } from "@/components/StatsCard";
import { ProjectCard } from "@/components/ProjectCard";
import { TaskCard } from "@/components/TaskCard";
import { SavedSearchCard } from "@/components/SavedSearchCard";
import { Button } from "@/components/ui/button";
import { Plus, Folder, GitBranch, CheckCircle2, Clock } from "lucide-react";

//todo: remove mock functionality
const mockProjects = [
  {
    id: "1",
    name: "Customer Onboarding System",
    description: "Streamline new customer intake with automated workflows",
    status: "active" as const,
    dueDate: "Dec 15, 2024",
    teamSize: 5,
    activeWorkflows: 3,
  },
  {
    id: "2",
    name: "Product Launch Campaign",
    description: "Marketing workflow for Q1 product release",
    status: "planning" as const,
    dueDate: "Jan 20, 2025",
    teamSize: 8,
    activeWorkflows: 2,
  },
  {
    id: "3",
    name: "Employee Training Portal",
    description: "Onboarding and continuous learning platform",
    status: "active" as const,
    dueDate: "Dec 30, 2024",
    teamSize: 4,
    activeWorkflows: 5,
  },
];

const mockTasks = [
  {
    id: "1",
    title: "Review documentation requirements",
    project: "Customer Onboarding",
    assignee: "Sarah Johnson",
    dueDate: "Dec 12",
    priority: "high" as const,
    status: "in-progress" as const,
  },
  {
    id: "2",
    title: "Setup access credentials",
    project: "Customer Onboarding",
    assignee: "Mike Chen",
    dueDate: "Dec 15",
    priority: "medium" as const,
    status: "pending" as const,
  },
];

const mockSavedSearches = [
  {
    id: "1",
    name: "High Priority Active Projects",
    filters: "type:project, priority:high, status:active",
    resultCount: 12,
  },
  {
    id: "2",
    name: "Overdue Tasks",
    filters: "type:task, dueDate:<today",
    resultCount: 5,
  },
];

export default function Dashboard() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your project overview
            </p>
          </div>
          <Button data-testid="button-new-project">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Projects"
            value={24}
            icon={Folder}
            trend={{ value: 12, direction: "up" }}
            subtitle="Across all teams"
          />
          <StatsCard
            title="Workflows"
            value={47}
            icon={GitBranch}
            subtitle="Ready to use"
          />
          <StatsCard
            title="Completed Tasks"
            value={156}
            icon={CheckCircle2}
            trend={{ value: 8, direction: "up" }}
            subtitle="This month"
          />
          <StatsCard
            title="Pending Tasks"
            value={23}
            icon={Clock}
            trend={{ value: 5, direction: "down" }}
            subtitle="Due this week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Projects</h2>
              <Button variant="outline" size="sm" data-testid="button-view-all-projects">
                View All
              </Button>
            </div>
            <div className="grid gap-4">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
              <div className="space-y-3">
                {mockTasks.map((task) => (
                  <TaskCard key={task.id} {...task} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Saved Searches</h2>
              <div className="space-y-3">
                {mockSavedSearches.map((search) => (
                  <SavedSearchCard key={search.id} {...search} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
