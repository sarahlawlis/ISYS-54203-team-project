import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X, Library } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Attribute as DBAttribute, SavedSearch } from "@shared/schema";

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
  smartValue?: string; // For smart names like "is me", "today", etc.
  visible: boolean;
}

type FieldType = 'text' | 'date' | 'user' | 'number' | 'status';

interface FieldOption {
  value: string;
  label: string;
  type: FieldType;
}

// Smart value options for different field types
const smartValueOptions = {
  user: [
    { value: '@me', label: 'Me' },
    { value: '@my-team', label: 'My Team' },
  ],
  date: [
    { value: '@today', label: 'Today' },
    { value: '@this-week', label: 'This Week' },
    { value: '@this-month', label: 'This Month' },
    { value: '@this-year', label: 'This Year' },
  ],
};

// Operators by field type
const operatorsByType = {
  text: [
    { value: 'contains', label: 'contains' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  date: [
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' },
    { value: 'on', label: 'on' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  user: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'is_me', label: 'is me' },
    { value: 'is_my_team', label: 'is my team' },
    { value: 'not_my_team', label: 'not my team' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  number: [
    { value: 'equals', label: 'equals' },
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
    { value: 'between', label: 'between' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ],
  status: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
  ],
};

export default function SearchCreation() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const searchId = params.id;
  const isEditMode = !!searchId;

  const [searchName, setSearchName] = useState("");
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch custom attributes from database
  const { data: customAttributes = [] } = useQuery<DBAttribute[]>({
    queryKey: ["/api/attributes"],
  });

  // Fetch existing search data if in edit mode
  const { data: existingSearch, isLoading: isLoadingSearch } = useQuery<SavedSearch>({
    queryKey: ["/api/saved-searches", searchId],
    enabled: isEditMode,
  });

  // Project filters state
  const [projectFilters, setProjectFilters] = useState<FilterRow[]>([]);

  // Task filters state
  const [taskFilters, setTaskFilters] = useState<FilterRow[]>([]);

  // File filters state
  const [fileFilters, setFileFilters] = useState<FilterRow[]>([]);

  // Attribute filters state
  const [attributeFilters, setAttributeFilters] = useState<FilterRow[]>([]);

  // Load existing search data when in edit mode
  useEffect(() => {
    if (existingSearch) {
      setSearchName(existingSearch.name);
      try {
        const parsedFilters = JSON.parse(existingSearch.filters);
        if (parsedFilters.projectFilters) {
          setProjectFilters(parsedFilters.projectFilters);
        }
        if (parsedFilters.taskFilters) {
          setTaskFilters(parsedFilters.taskFilters);
        }
        if (parsedFilters.fileFilters) {
          setFileFilters(parsedFilters.fileFilters);
        }
        if (parsedFilters.attributeFilters) {
          setAttributeFilters(parsedFilters.attributeFilters);
        }
      } catch (error) {
        console.error("Error parsing existing filters:", error);
        toast({
          title: "Error",
          description: "Failed to load search filters",
          variant: "destructive",
        });
      }
    }
  }, [existingSearch, toast]);

  const projectFieldOptions: FieldOption[] = [
    { value: "name", label: "Name", type: "text" },
    { value: "description", label: "Description", type: "text" },
    { value: "created_by", label: "Created By", type: "user" },
    { value: "project_manager", label: "Project Manager", type: "user" },
    { value: "started", label: "Started", type: "date" },
    { value: "completed", label: "Completed", type: "date" },
    { value: "last_modified", label: "Last Modified", type: "date" },
    { value: "status", label: "Status", type: "status" },
  ];

  const taskFieldOptions: FieldOption[] = [
    { value: "name", label: "Name", type: "text" },
    { value: "description", label: "Description", type: "text" },
    { value: "assigned_to", label: "Assigned To", type: "user" },
    { value: "created_by", label: "Created By", type: "user" },
    { value: "completed_by", label: "Completed By", type: "user" },
    { value: "started", label: "Started", type: "date" },
    { value: "completed", label: "Completed", type: "date" },
    { value: "last_modified", label: "Last Modified", type: "date" },
    { value: "status", label: "Status", type: "status" },
  ];

  const fileFieldOptions: FieldOption[] = [
    { value: "name", label: "File Name", type: "text" },
    { value: "extension", label: "Extension Type", type: "text" },
    { value: "description", label: "Description", type: "text" },
    { value: "created_by", label: "Created By", type: "user" },
    { value: "created_date", label: "Created Date", type: "date" },
    { value: "last_modified", label: "Last Modified", type: "date" },
  ];

  const addProjectFilter = () => {
    setProjectFilters([...projectFilters, {
      id: Date.now().toString(),
      field: "name",
      operator: "contains",
      value: "",
      visible: true,
    }]);
  };

  const removeProjectFilter = (id: string) => {
    setProjectFilters(projectFilters.filter(f => f.id !== id));
  };

  const updateProjectFilter = (id: string, updates: Partial<FilterRow>) => {
    setProjectFilters(projectFilters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addTaskFilter = () => {
    setTaskFilters([...taskFilters, {
      id: Date.now().toString(),
      field: "name",
      operator: "contains",
      value: "",
      visible: true,
    }]);
  };

  const removeTaskFilter = (id: string) => {
    setTaskFilters(taskFilters.filter(f => f.id !== id));
  };

  const updateTaskFilter = (id: string, updates: Partial<FilterRow>) => {
    setTaskFilters(taskFilters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addFileFilter = () => {
    setFileFilters([...fileFilters, {
      id: Date.now().toString(),
      field: "name",
      operator: "contains",
      value: "",
      visible: true,
    }]);
  };

  const removeFileFilter = (id: string) => {
    setFileFilters(fileFilters.filter(f => f.id !== id));
  };

  const updateFileFilter = (id: string, updates: Partial<FilterRow>) => {
    setFileFilters(fileFilters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addAttributeFilter = (attributeId?: string) => {
    const attribute = attributeId
      ? customAttributes.find(a => a.id === attributeId)
      : customAttributes[0];

    if (!attribute) return;

    const fieldType: FieldType =
      attribute.type === 'date' ? 'date' :
      attribute.type === 'number' ? 'number' :
      'text';

    setAttributeFilters([...attributeFilters, {
      id: Date.now().toString(),
      field: attribute.id,
      operator: fieldType === 'text' ? 'contains' : fieldType === 'number' ? 'equals' : 'on',
      value: "",
      visible: true,
    }]);
    setIsAttributeDialogOpen(false);
  };

  const removeAttributeFilter = (id: string) => {
    setAttributeFilters(attributeFilters.filter(f => f.id !== id));
  };

  const updateAttributeFilter = (id: string, updates: Partial<FilterRow>) => {
    setAttributeFilters(attributeFilters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSaveReport = async () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search name",
        variant: "destructive",
      });
      return;
    }

    try {
      const filters = {
        projectFilters,
        taskFilters,
        fileFilters,
        attributeFilters,
      };

      const url = isEditMode ? `/api/saved-searches/${searchId}` : "/api/saved-searches";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: searchName,
          filters: JSON.stringify(filters),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'save'} search`);
      }

      // Invalidate saved searches cache
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });

      toast({
        title: "Success",
        description: `Search ${isEditMode ? 'updated' : 'saved'} successfully`,
      });

      setLocation("/search");
    } catch (error) {
      console.error("Error saving search:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'save'} search`,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocation("/search");
  };

  const getFieldType = (fieldValue: string, fieldOptions: FieldOption[]): FieldType => {
    const field = fieldOptions.find(f => f.value === fieldValue);
    return field?.type || 'text';
  };

  const needsValueInput = (operator: string): boolean => {
    return !['is_empty', 'is_not_empty', 'is_me', 'is_my_team', 'not_my_team'].includes(operator);
  };

  const canUseSmartValues = (fieldType: FieldType, operator: string): boolean => {
    if (!needsValueInput(operator)) return false;
    return (fieldType === 'user' && ['is', 'is_not'].includes(operator)) ||
           (fieldType === 'date' && ['before', 'after', 'on'].includes(operator));
  };

  const renderFilterRow = (
    filter: FilterRow,
    onUpdate: (id: string, updates: Partial<FilterRow>) => void,
    onRemove: (id: string) => void,
    fieldOptions: FieldOption[],
    isAttributeFilter = false
  ) => {
    const fieldType = isAttributeFilter
      ? (customAttributes.find(a => a.id === filter.field)?.type === 'date' ? 'date' :
         customAttributes.find(a => a.id === filter.field)?.type === 'number' ? 'number' : 'text')
      : getFieldType(filter.field, fieldOptions);

    const operators = operatorsByType[fieldType] || operatorsByType.text;
    const showValueInput = needsValueInput(filter.operator);
    const showSmartValues = canUseSmartValues(fieldType, filter.operator);

    return (
      <div key={filter.id} className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-3">
          {isAttributeFilter ? (
            <Select
              value={filter.field}
              onValueChange={(value) => onUpdate(filter.id, { field: value })}
            >
              <SelectTrigger data-testid={`select-field-${filter.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customAttributes.map((attr) => (
                  <SelectItem key={attr.id} value={attr.id}>
                    {attr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select
              value={filter.field}
              onValueChange={(value) => onUpdate(filter.id, { field: value })}
            >
              <SelectTrigger data-testid={`select-field-${filter.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="col-span-2">
          <Select
            value={filter.operator}
            onValueChange={(value) => onUpdate(filter.id, { operator: value, smartValue: undefined })}
          >
            <SelectTrigger data-testid={`select-operator-${filter.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-5">
          {showValueInput ? (
            <div className="flex gap-2">
              {fieldType === 'date' ? (
                <Input
                  type="date"
                  value={filter.value}
                  onChange={(e) => onUpdate(filter.id, { value: e.target.value, smartValue: undefined })}
                  data-testid={`input-value-${filter.id}`}
                  className="flex-1"
                />
              ) : fieldType === 'number' ? (
                <Input
                  type="number"
                  placeholder={`Enter ${isAttributeFilter ? 'value' : filter.field}`}
                  value={filter.value}
                  onChange={(e) => onUpdate(filter.id, { value: e.target.value })}
                  data-testid={`input-value-${filter.id}`}
                  className="flex-1"
                />
              ) : (
                <Input
                  placeholder={`Enter ${isAttributeFilter ? 'value' : filter.field}`}
                  value={filter.value}
                  onChange={(e) => onUpdate(filter.id, { value: e.target.value, smartValue: undefined })}
                  data-testid={`input-value-${filter.id}`}
                  className="flex-1"
                />
              )}
              {showSmartValues && (
                <Select
                  value={filter.smartValue || ''}
                  onValueChange={(value) => onUpdate(filter.id, { smartValue: value, value: '' })}
                >
                  <SelectTrigger className="w-[140px]" data-testid={`select-smart-value-${filter.id}`}>
                    <SelectValue placeholder="Smart value" />
                  </SelectTrigger>
                  <SelectContent>
                    {(fieldType === 'user' ? smartValueOptions.user : smartValueOptions.date).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <div className="h-10 flex items-center text-sm text-muted-foreground">
              No value needed
            </div>
          )}
        </div>

        <div className="col-span-1 flex items-center justify-center">
          <Select
            value={filter.visible ? "visible" : "hidden"}
            onValueChange={(value) => onUpdate(filter.id, { visible: value === "visible" })}
          >
            <SelectTrigger className="w-full" data-testid={`select-visibility-${filter.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(filter.id)}
            data-testid={`button-remove-filter-${filter.id}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isEditMode && isLoadingSearch) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading search...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEditMode ? 'Edit Search' : 'Create Search'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure advanced filters for your search report
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search-name">Search Name</Label>
          <Input
            id="search-name"
            placeholder="Enter search name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            data-testid="input-search-name"
          />
        </div>

        <Accordion type="multiple" defaultValue={["project"]} className="space-y-4">
          <AccordionItem value="project" className="border rounded-card overflow-hidden">
            <Card className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid="accordion-project-filters">
                <CardHeader className="p-0">
                  <h3 className="text-base font-semibold">Project Filters</h3>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4 space-y-3">
                  {projectFilters.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-3">
                      No project filters added yet
                    </p>
                  ) : (
                    projectFilters.map((filter) =>
                      renderFilterRow(filter, updateProjectFilter, removeProjectFilter, projectFieldOptions)
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addProjectFilter}
                    className="mt-2"
                    data-testid="button-add-project-filter"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Filter
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="task" className="border rounded-card overflow-hidden">
            <Card className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid="accordion-task-filters">
                <CardHeader className="p-0">
                  <h3 className="text-base font-semibold">Task Filters</h3>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4 space-y-3">
                  {taskFilters.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-3">
                      No task filters added yet
                    </p>
                  ) : (
                    taskFilters.map((filter) =>
                      renderFilterRow(filter, updateTaskFilter, removeTaskFilter, taskFieldOptions)
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTaskFilter}
                    className="mt-2"
                    data-testid="button-add-task-filter"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Filter
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="file" className="border rounded-card overflow-hidden">
            <Card className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid="accordion-file-filters">
                <CardHeader className="p-0">
                  <h3 className="text-base font-semibold">File Filters</h3>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4 space-y-3">
                  {fileFilters.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-3">
                      No file filters added yet
                    </p>
                  ) : (
                    fileFilters.map((filter) =>
                      renderFilterRow(filter, updateFileFilter, removeFileFilter, fileFieldOptions)
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFileFilter}
                    className="mt-2"
                    data-testid="button-add-file-filter"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Filter
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="attribute" className="border rounded-card overflow-hidden">
            <Card className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid="accordion-attribute-filters">
                <CardHeader className="p-0">
                  <h3 className="text-base font-semibold">Attribute Filters</h3>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4">
                  {attributeFilters.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-3">
                      No attribute filters added yet
                    </p>
                  ) : (
                    <div className="space-y-3 mb-3">
                      {attributeFilters.map((filter) =>
                        renderFilterRow(filter, updateAttributeFilter, removeAttributeFilter, [], true)
                      )}
                    </div>
                  )}

                  <Dialog open={isAttributeDialogOpen} onOpenChange={setIsAttributeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-add-attribute"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Attribute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Attribute</DialogTitle>
                        <DialogDescription>
                          Choose an attribute from your library to add as a filter
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 max-h-[400px] overflow-auto">
                        {customAttributes.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No attributes available. Create attributes first in the Attributes library.
                          </p>
                        ) : (
                          customAttributes.map((attr) => (
                            <button
                              key={attr.id}
                              onClick={() => addAttributeFilter(attr.id)}
                              className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="font-medium">{attr.name}</div>
                              <div className="text-sm text-muted-foreground">{attr.type}</div>
                              {attr.description && (
                                <div className="text-xs text-muted-foreground mt-1">{attr.description}</div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSaveReport} data-testid="button-save-report">
            Save Search
          </Button>
        </div>
      </div>
    </div>
  );
}
