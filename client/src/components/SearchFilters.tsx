import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Save } from "lucide-react";
import { useState } from "react";

export function SearchFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [dateRange, setDateRange] = useState("all-time");

  const handleSearch = () => {
    console.log("Search triggered", { searchTerm, entityType, dateRange });
  };

  const handleSaveSearch = () => {
    console.log("Save search triggered");
  };

  return (
    <Card className="rounded-card">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-base">Search Filters</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-input">Search Term</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-input"
              placeholder="Search across all entities..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entity-type">Entity Type</Label>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger id="entity-type" data-testid="select-entity-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
              <SelectItem value="workflows">Workflows</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="forms">Forms</SelectItem>
              <SelectItem value="attributes">Attributes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-range">Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger id="date-range" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSearch} className="flex-1" data-testid="button-search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={handleSaveSearch} data-testid="button-save-search">
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
