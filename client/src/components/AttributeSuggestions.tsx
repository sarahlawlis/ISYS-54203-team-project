import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, RefreshCw, X } from "lucide-react";
import type { Attribute } from "@shared/schema";

interface AttributeSuggestionsProps {
  suggestions: Attribute[];
  isLoading: boolean;
  onAddAttribute: (attribute: Attribute) => void;
  onRefresh: () => void;
}

export function AttributeSuggestions({
  suggestions,
  isLoading,
  onAddAttribute,
  onRefresh,
}: AttributeSuggestionsProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Track if we've completed at least one load attempt
  useEffect(() => {
    if (!isLoading && !hasLoadedOnce) {
      console.log('[AttributeSuggestions] First load completed');
      setHasLoadedOnce(true);
    }
  }, [isLoading, hasLoadedOnce]);

  // Don't render if explicitly hidden
  if (isHidden) {
    console.log('[AttributeSuggestions] Hidden by user');
    return null;
  }

  // Show component if loading or has suggestions, or if we haven't loaded once yet
  const shouldShow = isLoading || suggestions.length > 0 || !hasLoadedOnce;
  console.log('[AttributeSuggestions] Render check:', { isLoading, suggestionsCount: suggestions.length, hasLoadedOnce, shouldShow });

  // Don't show if we should hide
  if (!shouldShow) {
    console.log('[AttributeSuggestions] Not showing - shouldShow is false');
    return null;
  }

  // Minimized view - compact pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-white shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">AI Suggestions</span>
          {suggestions.length > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {suggestions.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Expanded view - full panel
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 flex flex-col rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 shadow-2xl border border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            AI Suggestions
          </span>
          {suggestions.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-xs font-bold text-white">
              {suggestions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHidden(true)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
            <span className="text-sm text-muted-foreground">
              Generating suggestions...
            </span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-3" />
            <span className="text-sm text-muted-foreground text-center">
              No suggestions available at the moment
            </span>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              AI-recommended attributes for your form
            </p>
            <div className="space-y-2">
              {suggestions.map((attr) => {
                const Icon = attr.icon as any;
                return (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-white dark:bg-gray-900 dark:border-blue-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                        <Icon className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                          {attr.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {attr.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onAddAttribute(attr)}
                      className="ml-2 h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {!isLoading && suggestions.length > 0 && (
        <div className="p-3 border-t border-blue-200 dark:border-blue-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="w-full text-xs text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Suggestions
          </Button>
        </div>
      )}
    </div>
  );
}
