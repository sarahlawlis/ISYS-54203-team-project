import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

export type ViewMode = "cards" | "table";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        className={`toggle-elevate ${view === "cards" ? "toggle-elevated" : ""}`}
        onClick={() => onViewChange("cards")}
        data-testid="button-view-cards"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`toggle-elevate ${view === "table" ? "toggle-elevated" : ""}`}
        onClick={() => onViewChange("table")}
        data-testid="button-view-table"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}
