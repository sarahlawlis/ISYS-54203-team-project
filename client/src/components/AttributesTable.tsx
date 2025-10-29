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
import { AttributeCardProps } from "./AttributeCard";
import { 
  FileText, 
  Calendar, 
  CheckSquare, 
  Upload, 
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Link as LinkIcon,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { CreateAttributeDialog } from "./CreateAttributeDialog";

const typeIcons: Record<string, any> = {
  text: FileText,
  number: Hash,
  date: Calendar,
  boolean: CheckSquare,
  textarea: AlignLeft,
  email: Mail,
  phone: Phone,
  url: LinkIcon,
  file: Upload,
  "Y/N": CheckSquare,
};

interface AttributesTableProps {
  attributes: AttributeCardProps[];
}

export function AttributesTable({ attributes }: AttributesTableProps) {
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);

  return (
    <>
    <div className="border rounded-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Usage Count</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributes.map((attr) => {
            const Icon = typeIcons[attr.type];
            return (
              <TableRow key={attr.id} className="hover-elevate" data-testid={`row-attribute-${attr.id}`}>
                <TableCell className="font-medium font-mono">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {attr.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{attr.type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {attr.usageCount} form{attr.usageCount !== 1 ? 's' : ''}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-attribute-menu-${attr.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        data-testid={`button-edit-attribute-${attr.id}`}
                        onClick={() => setEditingAttributeId(attr.id)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" data-testid={`button-delete-attribute-${attr.id}`}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    
    {editingAttributeId && (
      <CreateAttributeDialog 
        open={!!editingAttributeId} 
        onOpenChange={(open) => !open && setEditingAttributeId(null)}
        editAttributeId={editingAttributeId}
      />
    )}
    </>
  );
}
