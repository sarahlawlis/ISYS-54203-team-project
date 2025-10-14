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
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
  visible: boolean;
}

export default function SearchCreation() {
  const [, setLocation] = useLocation();
  const [searchName, setSearchName] = useState("");
  
  // Project filters state
  const [projectFilters, setProjectFilters] = useState<FilterRow[]>([
    { id: "1", field: "name", operator: "contains", value: "", visible: true },
  ]);

  // Task filters state
  const [taskFilters, setTaskFilters] = useState<FilterRow[]>([
    { id: "1", field: "name", operator: "contains", value: "", visible: true },
  ]);

  // File filters state
  const [fileFilters, setFileFilters] = useState<FilterRow[]>([
    { id: "1", field: "name", operator: "contains", value: "", visible: true },
  ]);

  // Attribute filters state
  const [attributeFilters, setAttributeFilters] = useState<FilterRow[]>([]);

  const addProjectFilter = () => {
    setProjectFilters([...projectFilters, {
      id: Date.now().toString(),
      field: "name",
      operator: "is",
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
      operator: "is",
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
      operator: "is",
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

  const addAttributeFilter = () => {
    setAttributeFilters([...attributeFilters, {
      id: Date.now().toString(),
      field: "name",
      operator: "is",
      value: "",
      visible: true,
    }]);
  };

  const removeAttributeFilter = (id: string) => {
    setAttributeFilters(attributeFilters.filter(f => f.id !== id));
  };

  const updateAttributeFilter = (id: string, updates: Partial<FilterRow>) => {
    setAttributeFilters(attributeFilters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSaveReport = () => {
    console.log("Saving report:", {
      name: searchName,
      projectFilters,
      taskFilters,
      fileFilters,
      attributeFilters,
    });
    setLocation("/search");
  };

  const handleCancel = () => {
    setLocation("/search");
  };

  const renderFilterRow = (
    filter: FilterRow,
    onUpdate: (id: string, updates: Partial<FilterRow>) => void,
    onRemove: (id: string) => void,
    fieldOptions: { value: string; label: string }[]
  ) => (
    <div key={filter.id} className="grid grid-cols-12 gap-3 items-start">
      <div className="col-span-3">
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
      </div>

      <div className="col-span-2">
        <Select
          value={filter.operator}
          onValueChange={(value) => onUpdate(filter.id, { operator: value })}
        >
          <SelectTrigger data-testid={`select-operator-${filter.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="is">is</SelectItem>
            <SelectItem value="contains">contains</SelectItem>
            <SelectItem value="starts_with">starts with</SelectItem>
            <SelectItem value="ends_with">ends with</SelectItem>
            <SelectItem value="greater_than">&gt;</SelectItem>
            <SelectItem value="less_than">&lt;</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-5">
        <Input
          placeholder={`Enter ${filter.field}`}
          value={filter.value}
          onChange={(e) => onUpdate(filter.id, { value: e.target.value })}
          data-testid={`input-value-${filter.id}`}
        />
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

  const projectFieldOptions = [
    { value: "name", label: "Project Name" },
    { value: "description", label: "Project Description" },
    { value: "created_by", label: "Created By" },
    { value: "creation_date", label: "Creation Date" },
    { value: "last_modified", label: "Last Modified" },
    { value: "due_date", label: "Due Date" },
    { value: "completion_date", label: "Completion Date" },
    { value: "status", label: "Status" },
  ];

  const taskFieldOptions = [
    { value: "name", label: "Task Name" },
    { value: "description", label: "Description" },
    { value: "assigned_to", label: "Assigned to" },
    { value: "creation_date", label: "Creation Date" },
    { value: "due_date", label: "Due Date" },
    { value: "completion_date", label: "Completion Date" },
    { value: "status", label: "Task Status" },
  ];

  const fileFieldOptions = [
    { value: "housing_attribute", label: "Housing Attribute" },
    { value: "name", label: "File Name" },
    { value: "type", label: "File Type" },
    { value: "description", label: "Description" },
    { value: "creation_date", label: "Creation Date" },
    { value: "created_by", label: "Created By" },
    { value: "last_modified", label: "Last Modified" },
    { value: "version", label: "Version" },
  ];

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Create Search</h1>
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

        <Accordion type="multiple" defaultValue={["project", "task", "file"]} className="space-y-4">
          <AccordionItem value="project" className="border rounded-card overflow-hidden">
            <Card className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid="accordion-project-filters">
                <CardHeader className="p-0">
                  <h3 className="text-base font-semibold">Project Filters</h3>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4 space-y-3">
                  {projectFilters.map((filter) =>
                    renderFilterRow(filter, updateProjectFilter, removeProjectFilter, projectFieldOptions)
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
                  {taskFilters.map((filter) =>
                    renderFilterRow(filter, updateTaskFilter, removeTaskFilter, taskFieldOptions)
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
                  {fileFilters.map((filter) =>
                    renderFilterRow(filter, updateFileFilter, removeFileFilter, fileFieldOptions)
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
                        renderFilterRow(filter, updateAttributeFilter, removeAttributeFilter, [
                          { value: "name", label: "Attribute Name" },
                          { value: "type", label: "Attribute Type" },
                          { value: "value", label: "Attribute Value" },
                        ])
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAttributeFilter}
                    data-testid="button-add-attribute"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Attribute
                  </Button>
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
            Save Report
          </Button>
        </div>
      </div>
    </div>
  );
}
