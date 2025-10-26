import { WorkflowCard } from "@/components/WorkflowCard";
import { WorkflowsTable } from "@/components/WorkflowsTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

//todo: remove mock functionality
const mockWorkflows = [
  {
    id: "1",
    name: "New Employee Onboarding",
    description: "Complete workflow for onboarding new team members with documentation, access setup, and training tasks",
    taskCount: 8,
    usageCount: 24,
    category: "HR",
  },
  {
    id: "2",
    name: "Customer Quote Generation",
    description: "Automated process for creating and approving customer quotes with pricing validation",
    taskCount: 5,
    usageCount: 156,
    category: "Sales",
  },
  {
    id: "3",
    name: "Product Design Review",
    description: "Multi-stage design review process with stakeholder approvals and feedback collection",
    taskCount: 12,
    usageCount: 43,
    category: "Design",
  },
  {
    id: "4",
    name: "Contract Approval",
    description: "Legal review and approval workflow for vendor and customer contracts",
    taskCount: 6,
    usageCount: 89,
    category: "Legal",
  },
  {
    id: "5",
    name: "Bug Triage Process",
    description: "Systematic bug reporting, prioritization, and assignment workflow",
    taskCount: 7,
    usageCount: 234,
    category: "Engineering",
  },
  {
    id: "6",
    name: "Content Publishing",
    description: "Editorial workflow for creating, reviewing, and publishing content",
    taskCount: 9,
    usageCount: 67,
    category: "Marketing",
  },
];

export default function Workflows() {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("workflows-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("workflows-view", newView);
  };

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

        {view === "cards" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} {...workflow} />
            ))}
          </div>
        ) : (
          <WorkflowsTable workflows={mockWorkflows} />
        )}
      </div>
    </div>
  );
}
