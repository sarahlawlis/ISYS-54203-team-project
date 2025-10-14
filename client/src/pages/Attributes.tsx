import { AttributeCard } from "@/components/AttributeCard";
import { AttributesTable } from "@/components/AttributesTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";

//todo: remove mock functionality
const mockAttributes = [
  { id: "1", name: "customer_email", type: "text" as const, usageCount: 12 },
  { id: "2", name: "project_budget", type: "number" as const, usageCount: 8 },
  { id: "3", name: "deadline_date", type: "date" as const, usageCount: 15 },
  { id: "4", name: "is_priority", type: "boolean" as const, usageCount: 20 },
  { id: "5", name: "customer_name", type: "text" as const, usageCount: 18 },
  { id: "6", name: "team_size", type: "number" as const, usageCount: 10 },
  { id: "7", name: "start_date", type: "date" as const, usageCount: 14 },
  { id: "8", name: "requires_approval", type: "boolean" as const, usageCount: 9 },
  { id: "9", name: "department", type: "text" as const, usageCount: 16 },
  { id: "10", name: "estimated_hours", type: "number" as const, usageCount: 11 },
  { id: "11", name: "completion_date", type: "date" as const, usageCount: 13 },
  { id: "12", name: "is_active", type: "boolean" as const, usageCount: 22 },
];

export default function Attributes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("cards");

  useEffect(() => {
    const stored = localStorage.getItem("attributes-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("attributes-view", newView);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Attribute Library</h1>
            <p className="text-muted-foreground mt-1">
              Reusable attributes for your forms and workflows
            </p>
          </div>
          <Button data-testid="button-create-attribute">
            <Plus className="h-4 w-4 mr-2" />
            Create Attribute
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attributes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-attributes"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockAttributes.map((attr) => (
              <AttributeCard key={attr.id} {...attr} />
            ))}
          </div>
        ) : (
          <AttributesTable attributes={mockAttributes} />
        )}
      </div>
    </div>
  );
}
