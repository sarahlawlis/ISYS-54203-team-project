import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Type, Calendar, CheckSquare, Hash, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { CreateAttributeDialog } from "./CreateAttributeDialog";

export interface AttributeCardProps {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "boolean";
  usageCount: number;
  onEdit: (id: string) => void;
}

const typeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  boolean: CheckSquare,
};

const typeColors = {
  text: "bg-chart-1 text-white",
  number: "bg-chart-3 text-white",
  date: "bg-chart-2 text-white",
  boolean: "bg-chart-4 text-white",
};

export function AttributeCard({ id, name, type, usageCount, onEdit }: AttributeCardProps) {
  const Icon = typeIcons[type] || Type;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
    <Card className="rounded-card hover-elevate" data-testid={`card-attribute-${id}`}>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${typeColors[type]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm font-mono truncate" data-testid={`text-attribute-name-${id}`}>
              {name}
            </h4>
            <p className="text-xs text-muted-foreground">
              Used in {usageCount} form{usageCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-attribute-menu-${id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid={`button-edit-attribute-${id}`} onClick={() => onEdit(id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" data-testid={`button-delete-attribute-${id}`}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
    <CreateAttributeDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        attributeId={id}
      />
    </>
  );
}