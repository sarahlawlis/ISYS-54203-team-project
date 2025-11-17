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
import { ProjectCardProps } from "./ProjectCard";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  active: "bg-chart-2 text-white",
  planning: "bg-chart-3 text-white",
  completed: "bg-chart-4 text-white",
  "on-hold": "bg-muted text-muted-foreground",
};

interface ProjectsTableProps {
  projects: ProjectCardProps[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="border rounded-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assigned Users</TableHead>
            <TableHead>Workflows</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="hover-elevate" data-testid={`row-project-${project.id}`}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground">
                {project.description}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[project.status]}>{project.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{project.dueDate || "No due date"}</TableCell>
              <TableCell className="text-muted-foreground">
                {project.assignedUsernames && project.assignedUsernames.length > 0
                  ? `${project.assignedUsernames.length} ${project.assignedUsernames.length === 1 ? 'user' : 'users'}`
                  : 'No users'}
              </TableCell>
              <TableCell className="text-muted-foreground">{project.activeWorkflows}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid={`button-project-menu-${project.id}`}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem data-testid={`button-edit-project-${project.id}`}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid={`button-archive-project-${project.id}`}>
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" data-testid={`button-delete-project-${project.id}`}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
