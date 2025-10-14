import { SavedSearchCard } from "@/components/SavedSearchCard";
import { SavedSearchesTable } from "@/components/SavedSearchesTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

//todo: remove mock functionality
const mockSavedSearches = [
  {
    id: "1",
    name: "High Priority Active Projects",
    filters: "type:project, priority:high, status:active",
    resultCount: 12,
  },
  {
    id: "2",
    name: "Overdue Tasks",
    filters: "type:task, dueDate:<today",
    resultCount: 5,
  },
  {
    id: "3",
    name: "Marketing Workflows",
    filters: "type:workflow, category:marketing",
    resultCount: 8,
  },
  {
    id: "4",
    name: "Pending Approvals",
    filters: "type:task, status:pending, requires_approval:true",
    resultCount: 15,
  },
  {
    id: "5",
    name: "Recent Form Updates",
    filters: "type:form, modified:last_week",
    resultCount: 7,
  },
  {
    id: "6",
    name: "Active Projects by Budget",
    filters: "type:project, status:active, budget:>50000",
    resultCount: 9,
  },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("searches-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("searches-view", newView);
  };

  const handleCreateSearch = () => {
    setLocation("/search/new");
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Saved Searches</h1>
            <p className="text-muted-foreground mt-1">
              Manage and run your saved search reports
            </p>
          </div>
          <Button onClick={handleCreateSearch} data-testid="button-create-search">
            <Plus className="h-4 w-4 mr-2" />
            Create Search
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved searches..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-searches"
            />
          </div>
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockSavedSearches.map((search) => (
              <SavedSearchCard key={search.id} {...search} />
            ))}
          </div>
        ) : (
          <SavedSearchesTable searches={mockSavedSearches} />
        )}
      </div>
    </div>
  );
}
