import { useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, ChevronsUpDown, X } from "lucide-react";

const createProjectFormSchema = insertProjectSchema.extend({
  formIds: z.array(z.string()).optional(),
  workflowIds: z.array(z.string()).optional(),
  startWorkflows: z.boolean().default(false),
});

type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  initialData?: Partial<CreateProjectFormData>;
}

export function CreateProjectDialog({ open, onOpenChange, projectId, initialData }: CreateProjectDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!projectId;
  const [selectedForms, setSelectedForms] = useState<string[]>(initialData?.formIds || []);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>(initialData?.workflowIds || []);

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
    defaultValues: initialData || {
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

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
      setSelectedForms(initialData.formIds || []);
      setSelectedWorkflows(initialData.workflowIds || []);
    } else if (open && !initialData) {
      form.reset({
        name: "",
        description: "",
        status: "planning",
        teamSize: "0",
        dueDate: "",
        formIds: [],
        workflowIds: [],
        startWorkflows: false,
      });
      setSelectedForms([]);
      setSelectedWorkflows([]);
    }
  }, [open, initialData, form]);

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      const { formIds, workflowIds, startWorkflows, ...projectData } = data;
      
      if (isEditMode && projectId) {
        const projectRes = await apiRequest("PUT", `/api/projects/${projectId}`, {
          ...projectData,
          formIds,
          workflowIds,
        });
        return await projectRes.json();
      } else {
        const projectRes = await apiRequest("POST", "/api/projects", projectData);
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      }
      toast({
        title: isEditMode ? "Project updated" : "Project created",
        description: isEditMode 
          ? "Your project has been updated successfully."
          : "Your project has been created successfully.",
      });
      form.reset();
      setSelectedForms([]);
      setSelectedWorkflows([]);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEditMode 
          ? "Failed to update project. Please try again."
          : "Failed to create project. Please try again.",
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
          <DialogTitle>{isEditMode ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the project details and manage assigned forms and workflows."
              : "Fill in the details to create a new project. You can assign forms and workflows to organize your work."}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    data-testid="button-select-forms"
                  >
                    <span className="truncate">
                      {selectedForms.length === 0
                        ? "Select forms..."
                        : `${selectedForms.length} form${selectedForms.length !== 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search forms..." />
                    <CommandList>
                      <CommandEmpty>No forms found.</CommandEmpty>
                      <CommandGroup>
                        {forms.map((formItem) => (
                          <CommandItem
                            key={formItem.id}
                            onSelect={() => toggleForm(formItem.id)}
                            data-testid={`commanditem-form-${formItem.id}`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={selectedForms.includes(formItem.id)}
                                onCheckedChange={() => toggleForm(formItem.id)}
                                data-testid={`checkbox-form-${formItem.id}`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{formItem.name}</span>
                                {formItem.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {formItem.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedForms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedForms.map((formId) => {
                    const formItem = forms.find(f => f.id === formId);
                    return formItem ? (
                      <Badge
                        key={formId}
                        variant="secondary"
                        className="gap-1"
                        data-testid={`badge-form-${formId}`}
                      >
                        {formItem.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleForm(formId)}
                          data-testid={`button-remove-form-${formId}`}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <FormLabel>Assign Workflows</FormLabel>
              <FormDescription>
                Select workflows to associate with this project
              </FormDescription>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    data-testid="button-select-workflows"
                  >
                    <span className="truncate">
                      {selectedWorkflows.length === 0
                        ? "Select workflows..."
                        : `${selectedWorkflows.length} workflow${selectedWorkflows.length !== 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search workflows..." />
                    <CommandList>
                      <CommandEmpty>No workflows found.</CommandEmpty>
                      <CommandGroup>
                        {workflows.map((workflow) => (
                          <CommandItem
                            key={workflow.id}
                            onSelect={() => toggleWorkflow(workflow.id)}
                            data-testid={`commanditem-workflow-${workflow.id}`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={selectedWorkflows.includes(workflow.id)}
                                onCheckedChange={() => toggleWorkflow(workflow.id)}
                                data-testid={`checkbox-workflow-${workflow.id}`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{workflow.name}</span>
                                {workflow.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {workflow.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedWorkflows.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedWorkflows.map((workflowId) => {
                    const workflow = workflows.find(w => w.id === workflowId);
                    return workflow ? (
                      <Badge
                        key={workflowId}
                        variant="secondary"
                        className="gap-1"
                        data-testid={`badge-workflow-${workflowId}`}
                      >
                        {workflow.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleWorkflow(workflowId)}
                          data-testid={`button-remove-workflow-${workflowId}`}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
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
                {isEditMode ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
