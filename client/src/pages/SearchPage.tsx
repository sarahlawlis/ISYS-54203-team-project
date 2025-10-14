import { SearchFilters } from "@/components/SearchFilters";
import { SavedSearchCard } from "@/components/SavedSearchCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, GitBranch, FileText, ExternalLink } from "lucide-react";

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
];

const mockSearchResults = [
  {
    id: "1",
    type: "project",
    title: "Customer Onboarding System",
    description: "Streamline new customer intake with automated workflows",
    metadata: "Active • 5 team members • 3 workflows",
  },
  {
    id: "2",
    type: "workflow",
    title: "New Employee Onboarding",
    description: "Complete workflow for onboarding new team members",
    metadata: "HR • 8 tasks • Used 24 times",
  },
  {
    id: "3",
    type: "form",
    title: "Project Intake Form",
    description: "Initial project information and requirements gathering",
    metadata: "12 attributes • Used in 15 projects",
  },
];

const typeIcons = {
  project: Folder,
  workflow: GitBranch,
  form: FileText,
};

export default function SearchPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Search & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Search across all entities and save filters for quick access
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SearchFilters />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Saved Searches</h2>
              <div className="grid gap-3">
                {mockSavedSearches.map((search) => (
                  <SavedSearchCard key={search.id} {...search} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Search Results</h2>
                <Badge variant="outline">3 results</Badge>
              </div>
              <div className="space-y-3">
                {mockSearchResults.map((result) => {
                  const Icon = typeIcons[result.type as keyof typeof typeIcons];
                  return (
                    <Card
                      key={result.id}
                      className="rounded-card hover-elevate"
                      data-testid={`card-result-${result.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent flex-shrink-0">
                            <Icon className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                              <h3 className="font-medium text-sm truncate">
                                {result.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 font-mono">
                              {result.metadata}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-result-${result.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
