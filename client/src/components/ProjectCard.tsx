import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoreVertical, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "wouter";

export interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "completed" | "on-hold";
  dueDate: string;
  assignedUsernames?: string[];
  activeWorkflows: number;
}

const statusColors = {
  active: "bg-chart-2 text-white",
  planning: "bg-chart-3 text-white",
  completed: "bg-chart-4 text-white",
  "on-hold": "bg-muted text-muted-foreground",
};

export function ProjectCard({
  id,
  name,
  description,
  status,
  dueDate,
  assignedUsernames = [],
  activeWorkflows,
}: ProjectCardProps) {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const userCount = assignedUsernames.length;
  const displayUsernames = assignedUsernames.slice(0, 2).join(", ");
  const remainingCount = userCount > 2 ? userCount - 2 : 0;

  return (
    <Link href={`/projects/${id}`}>
      <Card className="rounded-card hover-elevate cursor-pointer" data-testid={`card-project-${id}`}>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" data-testid={`text-project-name-${id}`}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          </div>
          <div onClick={handleMenuClick}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-project-menu-${id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid={`button-edit-project-${id}`}>
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem data-testid={`button-archive-project-${id}`}>
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" data-testid={`button-delete-project-${id}`}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center gap-2">
            <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
              {status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {activeWorkflows} active workflow{activeWorkflows !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2 pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{dueDate || "No due date"}</span>
            </div>
            {userCount > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1" data-testid={`text-assigned-users-${id}`}>
                      <Users className="h-4 w-4" />
                      <span>
                        {userCount} {userCount === 1 ? 'user' : 'users'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      {displayUsernames}
                      {remainingCount > 0 && ` +${remainingCount} more`}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground/50" data-testid={`text-assigned-users-${id}`}>
                <Users className="h-4 w-4" />
                <span>No users</span>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" data-testid={`button-view-project-${id}`}>
            View
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
