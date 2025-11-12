import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SavedSearchCardProps } from "./SavedSearchCard";
import { MoreVertical, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

interface SavedSearchesTableProps {
  searches: SavedSearchCardProps[];
}

export function SavedSearchesTable({ searches }: SavedSearchesTableProps) {
  const [, setLocation] = useLocation();
  return (
    <div className="border rounded-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Filters</TableHead>
            <TableHead>Results</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searches.map((search) => (
            <TableRow key={search.id} className="hover-elevate" data-testid={`row-saved-search-${search.id}`}>
              <TableCell className="font-medium">{search.name}</TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground font-mono text-xs">
                {search.filters}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {search.resultCount} result{search.resultCount !== 1 ? 's' : ''}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid={`button-run-search-${search.id}`}
                    onClick={() => setLocation(`/search/results/${search.id}`)}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-search-menu-${search.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        data-testid={`button-edit-search-${search.id}`}
                        onClick={() => setLocation(`/search/edit/${search.id}`)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" data-testid={`button-delete-search-${search.id}`}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
