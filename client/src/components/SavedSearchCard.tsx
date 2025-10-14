import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MoreVertical, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SavedSearchCardProps {
  id: string;
  name: string;
  filters: string;
  resultCount: number;
}

export function SavedSearchCard({
  id,
  name,
  filters,
  resultCount,
}: SavedSearchCardProps) {
  return (
    <Card className="rounded-card hover-elevate" data-testid={`card-saved-search-${id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent flex-shrink-0">
              <Search className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate" data-testid={`text-search-name-${id}`}>
                {name}
              </h4>
              <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                {filters}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {resultCount} result{resultCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" data-testid={`button-run-search-${id}`}>
              <Play className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-search-menu-${id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid={`button-edit-search-${id}`}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" data-testid={`button-delete-search-${id}`}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
