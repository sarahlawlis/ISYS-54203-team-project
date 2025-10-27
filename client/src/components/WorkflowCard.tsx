import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Play, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export interface WorkflowCardProps {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  usageCount: number;
  category?: string;
}

export function WorkflowCard({
  id,
  name,
  description,
  taskCount,
  usageCount,
  category,
}: WorkflowCardProps) {
  const [, setLocation] = useLocation();

  return (
    <Card className="rounded-card hover-elevate" data-testid={`card-workflow-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <GitBranch className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" data-testid={`text-workflow-name-${id}`}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-workflow-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setLocation(`/workflows/${id}`)}
              data-testid={`button-edit-workflow-${id}`}
            >
              Edit Workflow
            </DropdownMenuItem>
            <DropdownMenuItem data-testid={`button-duplicate-workflow-${id}`}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" data-testid={`button-delete-workflow-${id}`}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {category && (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-mono">
            {taskCount} task{taskCount !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-muted-foreground">
            • Used {usageCount}x
          </span>
        </div>
        <Button size="sm" data-testid={`button-run-workflow-${id}`}>
          <Play className="h-3 w-3 mr-1" />
          Run
        </Button>
      </CardContent>
    </Card>
  );
}
