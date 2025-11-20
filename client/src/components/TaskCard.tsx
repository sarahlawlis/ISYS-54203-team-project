import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface TaskCardProps {
  id: string;
  title: string;
  project: string;
  assignee?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
}

const priorityColors = {
  low: "bg-chart-2 text-white",
  medium: "bg-chart-3 text-white",
  high: "bg-destructive text-destructive-foreground",
};

const statusIcons = {
  pending: Clock,
  "in-progress": AlertCircle,
  completed: CheckCircle2,
};

export function TaskCard({
  id,
  title,
  project,
  assignee,
  dueDate,
  priority,
  status,
}: TaskCardProps) {
  const StatusIcon = statusIcons[status];
  const initials = assignee
    ? assignee.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "";

  return (
    <Card className="rounded-card hover-elevate" data-testid={`card-task-${id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate" data-testid={`text-task-title-${id}`}>
              {title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">{project}</p>
          </div>
          <StatusIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {assignee && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            )}
            {dueDate && <span className="text-xs text-muted-foreground">{dueDate}</span>}
          </div>
          <div className="flex items-center gap-2">
            {status === "completed" ? (
              <Badge className="text-xs bg-chart-2 text-white">Completed</Badge>
            ) : (
              <Button size="sm" variant="outline" data-testid={`button-complete-task-${id}`}>
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
