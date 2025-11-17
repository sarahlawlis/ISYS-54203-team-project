import { SavedSearchCard } from "@/components/SavedSearchCard";
import { SavedSearchesTable } from "@/components/SavedSearchesTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { SavedSearch } from "@shared/schema";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [, setLocation] = useLocation();

  // Fetch saved searches from API
  const { data: savedSearches = [], isLoading } = useQuery<SavedSearch[]>({
    queryKey: ["/api/saved-searches"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("searches-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("searches-view", newView);
  };

  const handleCreateSearch = () => {
    setLocation("/search/create");
  };

  // Filter searches by search term
  const filteredSearches = savedSearches.filter((search) =>
    search.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Transform database searches to component format
  const transformedSearches = filteredSearches.map((search) => {
    // Parse the filters JSON to count total filters
    let resultCount = 0;
    try {
      const filters = JSON.parse(search.filters);
      resultCount =
        (filters.projectFilters?.length || 0) +
        (filters.taskFilters?.length || 0) +
        (filters.fileFilters?.length || 0) +
        (filters.attributeFilters?.length || 0);
    } catch (e) {
      // If parsing fails, just use 0
    }

    return {
      id: search.id,
      name: search.name,
      filters: search.filters,
      resultCount: resultCount,
    };
  });

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSearches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {savedSearches.length === 0
                ? "No saved searches yet. Create your first search to get started."
                : "No searches match your search criteria."}
            </p>
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {transformedSearches.map((search) => (
              <SavedSearchCard key={search.id} {...search} />
            ))}
          </div>
        ) : (
          <SavedSearchesTable searches={transformedSearches} />
        )}
      </div>
    </div>
  );
}
