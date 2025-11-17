import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileText, Folder, CheckSquare } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { SavedSearch } from "@shared/schema";

interface SearchResult {
  type: 'project' | 'task' | 'file';
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const searchId = params.id;

  // Fetch the saved search to get its name and filters
  const { data: savedSearch, isLoading: isLoadingSearch } = useQuery<SavedSearch>({
    queryKey: ["/api/saved-searches", searchId],
  });

  // Execute the search and get results
  const { data: results = [], isLoading: isLoadingResults } = useQuery<SearchResult[]>({
    queryKey: ["/api/search/execute", searchId],
    enabled: !!searchId,
  });

  const handleBack = () => {
    setLocation("/search");
  };

  const isLoading = isLoadingSearch || isLoadingResults;

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Folder className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case 'file':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            data-testid="button-back-to-searches"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {savedSearch?.name || 'Search Results'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoading
                ? 'Loading results...'
                : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <Card key={`${result.type}-${result.id}`} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent flex-shrink-0">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                          {getTypeLabel(result.type)}
                        </span>
                        <h3 className="font-medium truncate">{result.name}</h3>
                      </div>
                      {result.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {result.metadata && Object.keys(result.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
