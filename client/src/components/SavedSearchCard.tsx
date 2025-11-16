import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical, Play } from "lucide-react";
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

export interface SavedSearchCardProps {
  id: string;
  name: string;
  description?: string;
  visibility?: string;
  filters: string;
  resultCount: number;
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

export function SavedSearchCard({
  id,
  name,
  description,
  visibility,
  filters,
  resultCount,
}: SavedSearchCardProps) {
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const visibilityBadge = getVisibilityBadge(visibility);

  const deleteMutation = useMutation({
    mutationFn: async () => {
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
      toast({
        title: "Search deleted",
        description: `"${name}" has been successfully deleted.`,
      });
      setShowDeleteDialog(false);
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
    deleteMutation.mutate();
  };

  return (
    <>
      <Card className="rounded-card hover-elevate" data-testid={`card-saved-search-${id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent flex-shrink-0">
                <Search className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate" data-testid={`text-search-name-${id}`}>
                  {name}
                </h4>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {description}
                  </p>
                )}
                <div className="mt-2">
                  <Badge variant="secondary" className={`text-xs ${visibilityBadge.className}`}>
                    {visibilityBadge.label}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                data-testid={`button-run-search-${id}`}
                onClick={() => setLocation(`/search/results/${id}`)}
              >
                <Play className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid={`button-search-menu-${id}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    data-testid={`button-edit-search-${id}`}
                    onClick={() => setLocation(`/search/edit/${id}`)}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    data-testid={`button-delete-search-${id}`}
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved search?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
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
