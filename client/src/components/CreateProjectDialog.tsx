import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { insertProjectSchema, type Form as FormType, type Workflow } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const createProjectFormSchema = insertProjectSchema.extend({
  formIds: z.array(z.string()).optional(),
  workflowIds: z.array(z.string()).optional(),
  startWorkflows: z.boolean().default(false),
});

type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { toast } = useToast();
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: forms = [] } = useQuery<FormType[]>({
    queryKey: ["/api/forms"],
    enabled: open,
  });

  const { data: workflows = [] } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    enabled: open,
  });

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planning",
      teamSize: "0",
      dueDate: "",
      formIds: [],
      workflowIds: [],
      startWorkflows: false,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      const { formIds, workflowIds, startWorkflows, ...projectData } = data;
      
      const projectRes = await apiRequest("POST", "/api/projects", {
        ...projectData,
        ownerId: user?.id,
      });
      const project = await projectRes.json();

      if (formIds && formIds.length > 0) {
        await Promise.all(
          formIds.map((formId) =>
            apiRequest("POST", `/api/projects/${project.id}/forms`, { formId })
          )
        );
      }

      if (workflowIds && workflowIds.length > 0) {
        await Promise.all(
          workflowIds.map((workflowId) =>
            apiRequest("POST", `/api/projects/${project.id}/workflows`, {
              workflowId,
              status: startWorkflows ? "running" : "pending",
              startedAt: startWorkflows ? new Date().toISOString() : undefined,
            })
          )
        );
      }

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      form.reset();
      setSelectedForms([]);
      setSelectedWorkflows([]);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate({
      ...data,
      formIds: selectedForms,
      workflowIds: selectedWorkflows,
    });
  };

  const toggleForm = (formId: string) => {
    setSelectedForms((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    );
  };

  const toggleWorkflow = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(workflowId) ? prev.filter((id) => id !== workflowId) : [...prev, workflowId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project. You can assign forms and workflows to organize your work.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      data-testid="input-project-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-project-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-project-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        data-testid="input-team-size"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-due-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Assign Forms</FormLabel>
              <FormDescription>
                Select forms to attach to this project
              </FormDescription>
              <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                {forms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No forms available</p>
                ) : (
                  forms.map((formItem) => (
                    <div key={formItem.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`form-${formItem.id}`}
                        checked={selectedForms.includes(formItem.id)}
                        onCheckedChange={() => toggleForm(formItem.id)}
                        data-testid={`checkbox-form-${formItem.id}`}
                      />
                      <label
                        htmlFor={`form-${formItem.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {formItem.name}
                        {formItem.description && (
                          <span className="text-muted-foreground ml-2">
                            - {formItem.description}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <FormLabel>Assign Workflows</FormLabel>
              <FormDescription>
                Select workflows to associate with this project
              </FormDescription>
              <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                {workflows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No workflows available</p>
                ) : (
                  workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`workflow-${workflow.id}`}
                        checked={selectedWorkflows.includes(workflow.id)}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                        data-testid={`checkbox-workflow-${workflow.id}`}
                      />
                      <label
                        htmlFor={`workflow-${workflow.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {workflow.name}
                        {workflow.description && (
                          <span className="text-muted-foreground ml-2">
                            - {workflow.description}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedWorkflows.length > 0 && (
              <FormField
                control={form.control}
                name="startWorkflows"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-start-workflows"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Start workflows now</FormLabel>
                      <FormDescription>
                        Selected workflows will begin immediately upon project creation
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createProjectMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProjectMutation.isPending}
                data-testid="button-submit-project"
              >
                {createProjectMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
