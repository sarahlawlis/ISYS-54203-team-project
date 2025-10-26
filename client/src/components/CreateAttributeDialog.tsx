import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

const dataTypeToIcon: Record<string, string> = {
  text: "FileText",
  number: "Hash",
  date: "Calendar",
  email: "Mail",
  phone: "Phone",
  url: "LinkIcon",
  file: "Upload",
  "Y/N": "CheckSquare",
};

interface CreateAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAttributeDialog({ open, onOpenChange }: CreateAttributeDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Attribute name is required",
        variant: "destructive",
      });
      return;
    }

    if (!type) {
      toast({
        title: "Validation Error",
        description: "Data type is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const icon = dataTypeToIcon[type] || "FileText";
      
      await apiRequest("POST", "/api/attributes", {
        name: name.trim(),
        type,
        description: description.trim() || null,
        icon,
      });

      toast({
        title: "Success",
        description: "Attribute created successfully",
      });

      // Reset form
      setName("");
      setType("");
      setDescription("");
      onOpenChange(false);

      // Invalidate attributes cache
      queryClient.invalidateQueries({ queryKey: ["/api/attributes"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create attribute",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setType("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-attribute">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Attribute</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="attribute-name">
              Attribute Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="attribute-name"
              placeholder="Enter attribute name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-attribute-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-type">
              Data Type <span className="text-destructive">*</span>
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="data-type" data-testid="select-data-type">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="Y/N">Y/N</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              data-testid="input-description"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isCreating}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            data-testid="button-create-attribute"
          >
            {isCreating ? "Creating..." : "Create Attribute"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
