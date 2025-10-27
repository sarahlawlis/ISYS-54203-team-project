import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowCardProps } from "./WorkflowCard";
import { MoreVertical, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

interface WorkflowsTableProps {
  workflows: WorkflowCardProps[];
}

export function WorkflowsTable({ workflows }: WorkflowsTableProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="border rounded-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => (
            <TableRow key={workflow.id} className="hover-elevate" data-testid={`row-workflow-${workflow.id}`}>
              <TableCell className="font-medium">{workflow.name}</TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground">
                {workflow.description}
              </TableCell>
              <TableCell>
                {workflow.category && (
                  <Badge variant="outline">{workflow.category}</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono">{workflow.taskCount}</TableCell>
              <TableCell className="text-muted-foreground">{workflow.usageCount}x</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="sm" data-testid={`button-run-workflow-${workflow.id}`}>
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-workflow-menu-${workflow.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setLocation(`/workflows/${workflow.id}`)}
                        data-testid={`button-edit-workflow-${workflow.id}`}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`button-duplicate-workflow-${workflow.id}`}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" data-testid={`button-delete-workflow-${workflow.id}`}>
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
