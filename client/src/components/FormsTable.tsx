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
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FormData {
  id: string;
  name: string;
  description: string;
  attributeCount: number;
  usageCount: number;
  type: string;
}

interface FormsTableProps {
  forms: FormData[];
}

export function FormsTable({ forms }: FormsTableProps) {
  return (
    <div className="border rounded-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Attributes</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id} className="hover-elevate" data-testid={`row-form-${form.id}`}>
              <TableCell className="font-medium">{form.name}</TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground">
                {form.description}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{form.type}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground font-mono">{form.attributeCount}</TableCell>
              <TableCell className="text-muted-foreground">{form.usageCount}x</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" data-testid={`button-edit-form-${form.id}`}>
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-form-menu-${form.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem data-testid={`button-duplicate-form-${form.id}`}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" data-testid={`button-delete-form-${form.id}`}>
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
