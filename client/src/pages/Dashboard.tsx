import { StatsCard } from "@/components/StatsCard";
import { ProjectCard } from "@/components/ProjectCard";
import { TaskCard } from "@/components/TaskCard";
import { SavedSearchCard } from "@/components/SavedSearchCard";
import { Button } from "@/components/ui/button";
import { Plus, Folder, GitBranch, CheckCircle2, Clock, Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Project, SavedSearch } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DashboardStats = {
  activeProjectsCount: number;
  workflowsCount: number;
  completedFormsThisMonth: number;
  pendingFormsCount: number;
};

type AssignedForm = {
  id: string;
  projectId: string;
  formId: string;
  projectName: string;
  formName: string;
  assignedAt: string;
  isCompleted: boolean;
};

export default function Dashboard() {
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats', selectedSearchId],
    queryFn: async () => {
      const url = selectedSearchId 
        ? `/api/dashboard/stats?savedSearchId=${selectedSearchId}`
        : '/api/dashboard/stats';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects/recent'],
  });

  const { data: assignedForms, isLoading: formsLoading } = useQuery<AssignedForm[]>({
    queryKey: ['/api/dashboard/assigned-forms'],
  });

  const { data: savedSearches, isLoading: searchesLoading } = useQuery<SavedSearch[]>({
    queryKey: ['/api/saved-searches'],
  });

  const selectedSearchName = selectedSearchId 
    ? savedSearches?.find(s => s.id === selectedSearchId)?.name 
    : null;

  const getSubtitle = (defaultText: string) => {
    return selectedSearchName ? `Filtered by "${selectedSearchName}"` : defaultText;
  };

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={selectedSearchId || "all"} 
                onValueChange={(value) => setSelectedSearchId(value === "all" ? null : value)}
              >
                <SelectTrigger 
                  className="w-[200px]" 
                  data-testid="select-saved-search"
                >
                  <SelectValue placeholder="All Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="select-option-all">
                    All Data
                  </SelectItem>
                  {savedSearches?.map((search) => (
                    <SelectItem 
                      key={search.id} 
                      value={search.id}
                      data-testid={`select-option-search-${search.id}`}
                    >
                      {search.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSearchId && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedSearchId(null)}
                  data-testid="button-clear-filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button data-testid="button-new-project">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatsCard
                title="Active Projects"
                value={stats?.activeProjectsCount ?? 0}
                icon={Folder}
                subtitle={getSubtitle("Across all teams")}
              />
              <StatsCard
                title="Workflows"
                value={stats?.workflowsCount ?? 0}
                icon={GitBranch}
                subtitle={getSubtitle("Ready to use")}
              />
              <StatsCard
                title="Completed Forms"
                value={stats?.completedFormsThisMonth ?? 0}
                icon={CheckCircle2}
                subtitle={getSubtitle("This month")}
              />
              <StatsCard
                title="Pending Forms"
                value={stats?.pendingFormsCount ?? 0}
                icon={Clock}
                subtitle={getSubtitle("Assigned to you")}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Projects</h2>
              <Button variant="outline" size="sm" data-testid="button-view-all-projects">
                View All
              </Button>
            </div>
            {projectsLoading ? (
              <div className="grid gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : recentProjects && recentProjects.length > 0 ? (
              <div className="grid gap-4">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    description={project.description || ""}
                    status={project.status as "active" | "planning" | "completed" | "on-hold"}
                    dueDate={project.dueDate || ""}
                    activeWorkflows={0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent projects
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">My Forms</h2>
              {formsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : assignedForms && assignedForms.length > 0 ? (
                <div className="space-y-3">
                  {assignedForms.map((form) => (
                    <TaskCard
                      key={form.id}
                      id={form.id}
                      title={form.formName}
                      project={form.projectName}
                      assignee=""
                      dueDate=""
                      priority="medium"
                      status={form.isCompleted ? "completed" : "pending"}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No forms assigned
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Saved Searches</h2>
              {searchesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : savedSearches && savedSearches.length > 0 ? (
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <SavedSearchCard
                      key={search.id}
                      id={search.id}
                      name={search.name}
                      description={search.description || undefined}
                      visibility={search.visibility}
                      filters={search.filters}
                      resultCount={0}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No saved searches
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
