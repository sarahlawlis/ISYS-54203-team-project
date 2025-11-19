import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import type { Attribute } from "@shared/schema";
import {
  FileText,
  Calendar,
  Hash,
  Mail,
  Phone,
  Link as LinkIcon,
  Upload,
  CheckSquare,
} from "lucide-react";

const iconComponents: Record<string, any> = {
  FileText,
  Calendar,
  Hash,
  Mail,
  Phone,
  LinkIcon,
  Upload,
  CheckSquare,
};

interface SimilarAttributesWarningProps {
  similarAttributes: Attribute[];
  onUseExisting: (attribute: Attribute) => void;
  onDismiss: () => void;
}

export function SimilarAttributesWarning({
  similarAttributes,
  onUseExisting,
  onDismiss,
}: SimilarAttributesWarningProps) {
  if (similarAttributes.length === 0) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="ml-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-900">
            Similar attributes already exist. Would you like to use one of these instead?
          </p>

          <div className="space-y-2">
            {similarAttributes.map((attr) => {
              const IconComponent = iconComponents[attr.icon] || FileText;

              return (
                <div
                  key={attr.id}
                  className="flex items-center justify-between rounded-md border border-blue-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attr.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="capitalize">{attr.type}</span>
                        {attr.description && (
                          <>
                            <span>•</span>
                            <span className="line-clamp-1">{attr.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUseExisting(attr)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  >
                    Use This
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-blue-700 hover:bg-blue-100 hover:text-blue-800"
            >
              Create New Attribute Anyway
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
