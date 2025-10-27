import { WorkflowCard } from "@/components/WorkflowCard";
import { WorkflowsTable } from "@/components/WorkflowsTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Workflow } from "@shared/schema";

export default function Workflows() {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [, setLocation] = useLocation();

  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("workflows-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("workflows-view", newView);
  };

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workflow.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Design and manage reusable workflows
            </p>
          </div>
          <Button
            onClick={() => setLocation("/workflows/new")}
            data-testid="button-create-workflow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-workflows"
            />
          </div>
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading workflows...
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No workflows found matching your search." : "No workflows yet. Create your first workflow to get started!"}
            </p>
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard 
                key={workflow.id}
                id={workflow.id}
                name={workflow.name}
                description={workflow.description || ""}
                taskCount={0}
                usageCount={0}
                category=""
              />
            ))}
          </div>
        ) : (
          <WorkflowsTable workflows={filteredWorkflows.map((w) => ({
            ...w,
            description: w.description || "",
            taskCount: 0,
            usageCount: 0,
            category: "",
          }))} />
        )}
      </div>
    </div>
  );
}
