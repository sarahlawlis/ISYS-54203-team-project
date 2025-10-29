
import { AttributeCard } from "@/components/AttributeCard";
import { AttributesTable } from "@/components/AttributesTable";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreateAttributeDialog } from "@/components/CreateAttributeDialog";
import type { Attribute } from "@shared/schema";

export default function Attributes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("cards");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch attributes from database
  const { data: attributes = [] } = useQuery<Attribute[]>({
    queryKey: ["/api/attributes"],
  });

  // Fetch forms to calculate usage count
  const { data: forms = [] } = useQuery<any[]>({
    queryKey: ["/api/forms"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("attributes-view") as ViewMode | null;
    if (stored) setView(stored);
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("attributes-view", newView);
  };

  // Filter attributes based on search and type, then sort alphabetically
  const filteredAttributes = attributes
    .filter((attr) => {
      const matchesSearch = 
        attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attr.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || attr.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Transform attributes to include usageCount
  const attributesWithUsage = filteredAttributes.map((attr) => {
    // Count how many forms use this attribute
    const usageCount = forms.filter(form => {
      try {
        const formAttributes = JSON.parse(form.attributes || '[]');
        return formAttributes.some((formAttr: any) => formAttr.id === attr.id);
      } catch {
        return false;
      }
    }).length;

    return {
      id: attr.id,
      name: attr.name,
      type: attr.type as "text" | "number" | "date" | "boolean",
      usageCount,
    };
  });

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Attribute Library</h1>
            <p className="text-muted-foreground mt-1">
              Reusable attributes for your forms and workflows
            </p>
          </div>
          <Button 
            data-testid="button-create-attribute"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Attribute
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attributes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-attributes"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="Y/N">Y/N</SelectItem>
            </SelectContent>
          </Select>
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attributesWithUsage.map((attr) => (
              <AttributeCard key={attr.id} {...attr} />
            ))}
          </div>
        ) : (
          <AttributesTable attributes={attributesWithUsage} />
        )}
      </div>

      <CreateAttributeDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}
