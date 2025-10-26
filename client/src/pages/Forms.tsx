import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormsTable } from "@/components/FormsTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

//todo: remove mock functionality
const mockForms = [
  {
    id: "1",
    name: "Project Intake Form",
    description: "Initial project information and requirements gathering",
    attributeCount: 12,
    usageCount: 15,
    type: "project",
  },
  {
    id: "2",
    name: "Task Assignment Form",
    description: "Assign tasks to team members with details and deadlines",
    attributeCount: 8,
    usageCount: 89,
    type: "task",
  },
  {
    id: "3",
    name: "Customer Information",
    description: "Collect customer details for onboarding workflow",
    attributeCount: 10,
    usageCount: 34,
    type: "project",
  },
  {
    id: "4",
    name: "Design Review Checklist",
    description: "Design review criteria and approval form",
    attributeCount: 15,
    usageCount: 27,
    type: "task",
  },
  {
    id: "5",
    name: "Vendor Assessment",
    description: "Evaluate potential vendors and partners",
    attributeCount: 18,
    usageCount: 12,
    type: "project",
  },
];

export default function Forms() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("cards");

  const { data: forms = [] } = useQuery<typeof mockForms>({
    queryKey: ["/api/forms"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("forms-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("forms-view", newView);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Forms</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage custom forms for projects and tasks
            </p>
          </div>
          <Button onClick={() => setLocation("/forms/new")} data-testid="button-create-form">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-forms"
            />
          </div>
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms
              .filter(form => 
                form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((form) => (
              <Card
                key={form.id}
                className="rounded-card hover-elevate"
                data-testid={`card-form-${form.id}`}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent flex-shrink-0">
                      <FileText className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate" data-testid={`text-form-name-${form.id}`}>
                        {form.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {form.description}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-form-menu-${form.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          // Load existing form data or create new entry
                          const existingData = localStorage.getItem(`formData-${form.id}`);
                          if (!existingData) {
                            localStorage.setItem(`formData-${form.id}`, JSON.stringify({ 
                              name: form.name, 
                              description: form.description,
                              attributes: []
                            }));
                          }
                          setLocation(`/forms/new?formId=${form.id}`);
                        }}
                        data-testid={`button-edit-form-${form.id}`}
                      >
                        Edit Form
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`button-duplicate-form-${form.id}`}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" data-testid={`button-delete-form-${form.id}`}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {form.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {form.attributeCount} attributes
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • Used {form.usageCount}x
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // Load existing form data or create new entry
                      const existingData = localStorage.getItem(`formData-${form.id}`);
                      if (!existingData) {
                        localStorage.setItem(`formData-${form.id}`, JSON.stringify({ 
                          name: form.name, 
                          description: form.description,
                          attributes: []
                        }));
                      }
                      setLocation(`/forms/new?formId=${form.id}`);
                    }}
                    data-testid={`button-edit-form-inline-${form.id}`}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <FormsTable forms={forms.filter(form => 
            form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )} />
        )}
      </div>
    </div>
  );
}