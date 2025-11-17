import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavedSearchCardProps } from "./SavedSearchCard";
import { MoreVertical, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SavedSearchesTableProps {
  searches: SavedSearchCardProps[];
}

// Helper function to get visibility badge styling
function getVisibilityBadge(visibility?: string) {
  switch (visibility) {
    case 'private':
      return { label: 'Private', className: 'bg-red-100 text-red-700 hover:bg-red-100' };
    case 'shared':
      return { label: 'Shared', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' };
    case 'team':
      return { label: 'Team', className: 'bg-green-100 text-green-700 hover:bg-green-100' };
    case 'public':
      return { label: 'Public', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' };
    default:
      return { label: 'Public', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' };
  }
}

export function SavedSearchesTable({ searches }: SavedSearchesTableProps) {
  const [, setLocation] = useLocation();
  const [deleteSearchId, setDeleteSearchId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete search');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-searches'] });
      const searchName = searches.find(s => s.id === deleteSearchId)?.name || 'Search';
      toast({
        title: "Search deleted",
        description: `"${searchName}" has been successfully deleted.`,
      });
      setDeleteSearchId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting search",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (deleteSearchId) {
      deleteMutation.mutate(deleteSearchId);
    }
  };

  const searchToDelete = searches.find(s => s.id === deleteSearchId);

  return (
    <>
      <div className="border rounded-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Visibility</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searches.map((search) => {
              const visibilityBadge = getVisibilityBadge(search.visibility);
              return (
              <TableRow key={search.id} className="hover-elevate" data-testid={`row-saved-search-${search.id}`}>
                <TableCell className="font-medium">{search.name}</TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground text-sm">
                  {search.description || <span className="italic text-muted-foreground/60">No description</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-xs ${visibilityBadge.className}`}>
                    {visibilityBadge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      data-testid={`button-run-search-${search.id}`}
                      onClick={() => setLocation(`/search/results/${search.id}`)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-search-menu-${search.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          data-testid={`button-edit-search-${search.id}`}
                          onClick={() => setLocation(`/search/edit/${search.id}`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          data-testid={`button-delete-search-${search.id}`}
                          onClick={() => setDeleteSearchId(search.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}

          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteSearchId !== null} onOpenChange={(open) => !open && setDeleteSearchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved search?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{searchToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
