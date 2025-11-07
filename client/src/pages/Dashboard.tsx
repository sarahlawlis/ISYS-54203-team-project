import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Project, Task } from "@shared/schema";
import { CheckCircle2, Clock, FolderOpen, ListTodo, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: userProjects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/users", user?.id, "projects"],
    enabled: !!user?.id,
  });

  const { data: userTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/users", user?.id, "tasks"],
    enabled: !!user?.id,
  });

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const pendingTasks = userTasks.filter(t => t.status === "pending");
  const inProgressTasks = userTasks.filter(t => t.status === "in-progress");
  const completedTasks = userTasks.filter(t => t.status === "completed");
  const activeProjects = userProjects.filter(p => p.status === "active");

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16" data-testid="avatar-user">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || "User"} style={{ objectFit: 'cover' }} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-welcome">
                Welcome back, {user?.firstName || user?.email}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your projects and tasks
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            Log Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-projects">{activeProjects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {userProjects.length} total projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pending-tasks">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Waiting to be started
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-in-progress-tasks">{inProgressTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently working on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completed-tasks">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks finished
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                My Tasks
              </CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : userTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center" data-testid="text-no-tasks">
                  No tasks assigned yet. Check with your project manager.
                </p>
              ) : (
                <div className="space-y-3">
                  {userTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 rounded-md border hover-elevate"
                      data-testid={`task-${task.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{task.name}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "default"
                              : task.status === "in-progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {task.status}
                        </Badge>
                        {task.priority && (
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
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
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                My Projects
              </CardTitle>
              <CardDescription>Projects you're part of</CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : userProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center" data-testid="text-no-projects">
                  No projects yet. Ask your manager to add you to a project.
                </p>
              ) : (
                <div className="space-y-3">
                  {userProjects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between p-3 rounded-md border hover-elevate"
                      data-testid={`project-${project.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {project.description}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          project.status === "active"
                            ? "default"
                            : project.status === "completed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
