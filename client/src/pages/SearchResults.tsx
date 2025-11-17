import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, ArrowUpDown } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { SavedSearch } from "@shared/schema";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  type: 'project' | 'task' | 'file';
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
  smartValue?: string;
  visible: boolean;
}

interface ColumnConfig {
  field: string;
  label: string;
  type: 'text' | 'date' | 'user' | 'number' | 'status';
}

// Field label mapping
const fieldLabels: Record<string, string> = {
  name: 'Name',
  description: 'Description',
  status: 'Status',
  created_by: 'Created By',
  project_manager: 'Project Manager',
  started: 'Started',
  completed: 'Completed',
  last_modified: 'Last Modified',
  due_date: 'Due Date',
  team_size: 'Team Size',
};

// Field type mapping
const fieldTypes: Record<string, 'text' | 'date' | 'user' | 'number' | 'status'> = {
  name: 'text',
  description: 'text',
  status: 'status',
  created_by: 'user',
  project_manager: 'user',
  started: 'date',
  completed: 'date',
  last_modified: 'date',
  due_date: 'date',
  team_size: 'number',
};

// Status color mapping
const statusColors: Record<string, string> = {
  planning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  'on-hold': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const searchId = params.id;
  const { toast } = useToast();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Extract visible columns from filters
  const columns = useMemo(() => {
    if (!savedSearch?.filters) return [];

    try {
      const filters = JSON.parse(savedSearch.filters);
      const visibleColumns: ColumnConfig[] = [];

      // Get visible fields from project filters (in order they were added)
      if (filters.projectFilters) {
        filters.projectFilters.forEach((filter: FilterRow) => {
          if (filter.visible && filter.field) {
            visibleColumns.push({
              field: filter.field,
              label: fieldLabels[filter.field] || filter.field,
              type: fieldTypes[filter.field] || 'text',
            });
          }
        });
      }

      // TODO: Add task, file, and attribute filters when implemented

      return visibleColumns;
    } catch (error) {
      console.error("Error parsing filters:", error);
      return [];
    }
  }, [savedSearch]);

  // Check if no visible fields
  const hasNoVisibleFields = columns.length === 0 && results.length > 0;

  // Show notification if no visible fields
  if (hasNoVisibleFields && !isLoading) {
    toast({
      title: "No visible fields",
      description: `${results.length} result${results.length !== 1 ? 's' : ''} found, but no fields are marked as visible. Please edit the search to select visible fields.`,
      variant: "default",
    });
  }

  // Format cell value based on type
  const formatCellValue = (value: any, type: ColumnConfig['type']): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">—</span>;
    }

    switch (type) {
      case 'date': {
        try {
          const date = new Date(value);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
          });
          // Check if time is midnight (00:00) - if so, don't show time
          if (date.getHours() === 0 && date.getMinutes() === 0) {
            return dateStr;
          }
          return `${dateStr} at ${timeStr}`;
        } catch {
          return String(value);
        }
      }

      case 'user': {
        // Format: Full Name (username) or just username if no full name
        // For now, we only have username from backend
        return String(value);
      }

      case 'status': {
        const statusValue = String(value).toLowerCase();
        const colorClass = statusColors[statusValue] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        return (
          <Badge variant="outline" className={colorClass}>
            {String(value)}
          </Badge>
        );
      }

      case 'number': {
        return Number(value).toLocaleString();
      }

      default:
        return String(value);
    }
  };

  // Get cell value from result
  const getCellValue = (result: SearchResult, field: string): any => {
    // Check metadata first (this is where backend puts visible fields)
    if (result.metadata && field in result.metadata) {
      return result.metadata[field];
    }

    // Fall back to root properties
    if (field in result) {
      return (result as any)[field];
    }

    return null;
  };

  // Handle column header click for sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort results
  const sortedResults = useMemo(() => {
    if (!sortField) return results;

    return [...results].sort((a, b) => {
      const aValue = getCellValue(a, sortField);
      const bValue = getCellValue(b, sortField);

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Compare based on type
      let comparison = 0;
      const fieldType = fieldTypes[sortField] || 'text';

      if (fieldType === 'date') {
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else if (fieldType === 'number') {
        comparison = Number(aValue) - Number(bValue);
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [results, sortField, sortDirection]);

  // Handle row click - open in new tab
  const handleRowClick = (result: SearchResult) => {
    // TODO: Determine the correct URL based on result type
    // For now, assuming projects go to /projects/:id
    const url = `/projects/${result.id}`;
    window.open(url, '_blank');
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
        ) : hasNoVisibleFields ? (
          <Card className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} found, but no fields are marked as visible.
              </p>
              <Button
                onClick={() => setLocation(`/search/create/${searchId}`)}
                variant="outline"
              >
                Edit Search to Select Visible Fields
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.field}
                      className="cursor-pointer select-none hover:bg-accent/50"
                      onClick={() => handleSort(column.field)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((result) => (
                  <TableRow
                    key={`${result.type}-${result.id}`}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(result)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {formatCellValue(getCellValue(result, column.field), column.type)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
