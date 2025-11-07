import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectWorkflow, Workflow, ProjectMember, User } from "@shared/schema";
import { ArrowLeft, Calendar, Users, Edit, Play, Pause, Trash2, UserPlus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusColors = {
  active: "bg-chart-2 text-white",
  planning: "bg-chart-3 text-white",
  completed: "bg-chart-4 text-white",
  "on-hold": "bg-muted text-muted-foreground",
};

const workflowStatusColors = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-chart-2 text-white",
  completed: "bg-chart-4 text-white",
  failed: "bg-destructive text-destructive-foreground",
};

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addWorkflowDialogOpen, setAddWorkflowDialogOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"owner" | "manager" | "member" | "viewer">("member");

  const projectId = params?.id || "";

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: projectWorkflows = [], isLoading: workflowsLoading } = useQuery<ProjectWorkflow[]>({
    queryKey: ["/api/projects", projectId, "workflows"],
    enabled: !!projectId,
  });

  const { data: allWorkflows = [] } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  const { data: projectMembers = [], isLoading: membersLoading } = useQuery<ProjectMember[]>({
    queryKey: ["/api/projects", projectId, "members"],
    enabled: !!projectId,
  });

  const addWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/workflows`, {
        workflowId,
        status: "pending",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "workflows"] });
      toast({ title: "Workflow added", description: "Workflow has been added to the project." });
      setAddWorkflowDialogOpen(false);
      setSelectedWorkflowId("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add workflow.", variant: "destructive" });
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, status, startedAt, completedAt }: { id: string; status: string; startedAt?: string; completedAt?: string }) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}/workflows/${id}`, {
        status,
        startedAt,
        completedAt,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "workflows"] });
      toast({ title: "Workflow updated", description: "Workflow status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update workflow.", variant: "destructive" });
    },
  });

  const removeWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "workflows"] });
      toast({ title: "Workflow removed", description: "Workflow has been removed from the project." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove workflow.", variant: "destructive" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/members`, {
        userId: newMemberEmail,
        role: newMemberRole,
        accessLevel: "standard",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "members"] });
      toast({ title: "Member added", description: "Team member has been added to the project." });
      setAddMemberDialogOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("member");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add member.", variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "members"] });
      toast({ title: "Member removed", description: "Team member has been removed from the project." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    },
  });

  const handleTriggerWorkflow = (workflow: ProjectWorkflow) => {
    if (workflow.status === "running") {
      updateWorkflowMutation.mutate({
        id: workflow.id,
        status: "pending",
      });
    } else {
      updateWorkflowMutation.mutate({
        id: workflow.id,
        status: "running",
        startedAt: new Date().toISOString(),
      });
    }
  };

  if (projectLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <Button onClick={() => navigate("/projects")} className="mt-4" data-testid="button-back-to-projects">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const availableWorkflows = allWorkflows.filter(
    w => !projectWorkflows.some(pw => pw.workflowId === w.id)
  );

  return (
    <>
      <EditProjectDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <Dialog open={addWorkflowDialogOpen} onOpenChange={setAddWorkflowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workflow</DialogTitle>
            <DialogDescription>
              Select a workflow to add to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow</Label>
              <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                <SelectTrigger data-testid="select-workflow">
                  <SelectValue placeholder="Select a workflow" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddWorkflowDialogOpen(false)} data-testid="button-cancel-add-workflow">
              Cancel
            </Button>
            <Button
              onClick={() => selectedWorkflowId && addWorkflowMutation.mutate(selectedWorkflowId)}
              disabled={!selectedWorkflowId || addWorkflowMutation.isPending}
              data-testid="button-submit-add-workflow"
            >
              {addWorkflowMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID or Email</Label>
              <Input
                placeholder="Enter user ID or email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                data-testid="input-member-email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as any)}>
                <SelectTrigger data-testid="select-member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)} data-testid="button-cancel-add-member">
              Cancel
            </Button>
            <Button
              onClick={() => addMemberMutation.mutate()}
              disabled={!newMemberEmail || addMemberMutation.isPending}
              data-testid="button-submit-add-member"
            >
              {addMemberMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-full overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/projects")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold" data-testid="text-project-name">
                  {project.name}
                </h1>
                <p className="text-muted-foreground mt-1">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[project.status as keyof typeof statusColors]} data-testid="badge-project-status">
                {project.status}
              </Badge>
              <Button onClick={() => setEditDialogOpen(true)} data-testid="button-edit-project">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="workflows" data-testid="tab-workflows">Workflows</TabsTrigger>
              <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-due-date">
                      {project.dueDate || "Not set"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-team-size">
                      {projectMembers.length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-active-workflows">
                      {projectWorkflows.filter(w => w.status === "running").length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    <span className="text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    <span className="text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflows" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Project Workflows</h3>
                <Button onClick={() => setAddWorkflowDialogOpen(true)} data-testid="button-add-workflow">
                  Add Workflow
                </Button>
              </div>

              {workflowsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : projectWorkflows.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No workflows assigned to this project yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {projectWorkflows.map((pw) => {
                    const workflow = allWorkflows.find(w => w.id === pw.workflowId);
                    return (
                      <Card key={pw.id} data-testid={`card-workflow-${pw.id}`}>
                        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{workflow?.name || "Unknown Workflow"}</CardTitle>
                            <CardDescription>{workflow?.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={workflowStatusColors[pw.status as keyof typeof workflowStatusColors]}>
                              {pw.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-4">
                          <div className="text-sm text-muted-foreground">
                            {pw.startedAt && (
                              <span>Started: {new Date(pw.startedAt).toLocaleDateString()}</span>
                            )}
                            {pw.completedAt && (
                              <span className="ml-4">Completed: {new Date(pw.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={pw.status === "running" ? "outline" : "default"}
                              onClick={() => handleTriggerWorkflow(pw)}
                              data-testid={`button-trigger-workflow-${pw.id}`}
                            >
                              {pw.status === "running" ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeWorkflowMutation.mutate(pw.id)}
                              data-testid={`button-remove-workflow-${pw.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button onClick={() => setAddMemberDialogOpen(true)} data-testid="button-add-member">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {membersLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : projectMembers.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No team members assigned to this project yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {projectMembers.map((member) => (
                    <Card key={member.id} data-testid={`card-member-${member.id}`}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{member.userId}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{member.role}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Access: {member.accessLevel}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                          data-testid={`button-remove-member-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
