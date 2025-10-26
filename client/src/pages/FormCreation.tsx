import { useState, useEffect, useMemo } from "react";
import type { DragEvent } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  GripVertical,
  X,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateAttributeDialog } from "@/components/CreateAttributeDialog";
import type { Attribute as DBAttribute } from "@shared/schema";

interface Attribute {
  id: string;
  name: string;
  type: string;
  icon: any;
  description?: string;
}

interface FormAttribute extends Attribute {
  formId: string;
  visibility: 'Editable' | 'Required' | 'Read Only' | 'Hidden';
}

const builtInAttributes: Attribute[] = [
  { id: "1", name: "Customer Name", type: "text", icon: FileText },
  { id: "2", name: "Due Date", type: "date", icon: Calendar },
  { id: "3", name: "Retailer", type: "text", icon: FileText },
  { id: "4", name: "General Notes", type: "text", icon: AlignLeft },
  { id: "5", name: "Structural Design Needed", type: "Y/N", icon: CheckSquare },
  { id: "6", name: "Quotes", type: "file", icon: Upload },
  { id: "7", name: "Purchase Orders", type: "file", icon: Upload },
  { id: "8", name: "Structure Files", type: "file", icon: Upload },
  { id: "n1", name: "Email", type: "email", icon: Mail },
  { id: "n2", name: "Phone Number", type: "phone", icon: Phone },
  { id: "n3", name: "Number", type: "number", icon: Hash },
  { id: "n4", name: "URL", type: "url", icon: LinkIcon },
  { id: "n5", name: "Long Text", type: "textarea", icon: AlignLeft },
];

// Helper function to convert icon string to actual icon component
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    FileText,
    Calendar,
    CheckSquare,
    Upload,
    AlignLeft,
    Hash,
    Mail,
    Phone,
    LinkIcon,
  };
  return iconMap[iconName] || FileText;
};

export default function FormCreation() {
  const [, setLocation] = useLocation();
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAttributes, setFormAttributes] = useState<FormAttribute[]>([]);
  const [draggedOver, setDraggedOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [attributeSearch, setAttributeSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch custom attributes from database
  const { data: customAttributes = [] } = useQuery<DBAttribute[]>({
    queryKey: ["/api/attributes"],
  });

  // Merge built-in and custom attributes
  const allAttributes = useMemo(() => {
    const customAttrs: Attribute[] = customAttributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      type: attr.type,
      icon: getIconComponent(attr.icon),
    }));
    return [...builtInAttributes, ...customAttrs];
  }, [customAttributes]);

  // Load form data when editing existing form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formId = params.get('formId');

    if (formId) {
      const storedFormData = localStorage.getItem(`formData-${formId}`);
      if (storedFormData) {
        const formData = JSON.parse(storedFormData);
        setFormName(formData.name || "");
        setFormDescription(formData.description || "");
        
        // Restore icon property by matching attribute ID
        const restoredAttributes = (formData.attributes || []).map((attr: any) => {
          const matchingAttr = allAttributes.find(a => a.id === attr.id);
          return {
            ...attr,
            icon: matchingAttr?.icon || FileText,
          };
        });
        setFormAttributes(restoredAttributes);
      }
    }
  }, []);

  const handleDragStart = (e: DragEvent, attribute: Attribute) => {
    e.dataTransfer.setData("attributeId", attribute.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDraggedOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const attributeId = e.dataTransfer.getData("attributeId");
    if (attributeId) {
      const attribute = allAttributes.find(attr => attr.id === attributeId);
      if (attribute) {
        const newFormAttribute: FormAttribute = {
          ...attribute,
          formId: `form-${Date.now()}`,
          visibility: 'Editable',
        };
        setFormAttributes([...formAttributes, newFormAttribute]);
      }
    }
  };

  const handleReorderDragStart = (e: DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleReorderDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newAttributes = [...formAttributes];
    const draggedItem = newAttributes[draggedIndex];
    newAttributes.splice(draggedIndex, 1);
    newAttributes.splice(index, 0, draggedItem);

    setFormAttributes(newAttributes);
    setDraggedIndex(index);
  };

  const handleReorderDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveAttribute = (formId: string) => {
    setFormAttributes(formAttributes.filter(attr => attr.formId !== formId));
  };

  const updateVisibility = (formId: string, visibility: 'Editable' | 'Required' | 'Read Only' | 'Hidden') => {
    setFormAttributes(formAttributes.map(attr => 
      attr.formId === formId ? { ...attr, visibility } : attr
    ));
  };

  const handleSaveForm = () => {
    const params = new URLSearchParams(window.location.search);
    const formId = params.get('formId');
    
    if (formId) {
      // Update existing form - exclude icon from serialization
      const formData = {
        name: formName,
        description: formDescription,
        attributes: formAttributes.map(({ icon, ...attr }) => attr),
      };
      localStorage.setItem(`formData-${formId}`, JSON.stringify(formData));
      console.log("Form saved:", formData);
    }
    
    setLocation("/forms");
  };

  const handleSaveAs = () => {
    console.log("Save as:", { formName, formDescription, formAttributes });
  };

  const handleCancel = () => {
    setLocation("/forms");
  };

  const AttributeItem = ({ attribute, draggable = true }: { attribute: Attribute; draggable?: boolean }) => {
    const Icon = attribute.icon;
    const dbAttribute = customAttributes.find(a => a.id === attribute.id);
    
    return (
      <div
        draggable={draggable}
        onDragStart={(e) => draggable && handleDragStart(e, attribute)}
        className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${
          draggable ? "cursor-move hover-elevate active-elevate-2" : ""
        }`}
        data-testid={`attribute-${attribute.id}`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded bg-accent flex-shrink-0">
          <Icon className="h-4 w-4 text-accent-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attribute.name}</p>
          <p className="text-xs text-muted-foreground">{attribute.type}</p>
          {dbAttribute?.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={dbAttribute.description}>
              {dbAttribute.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderFieldPreview = (attr: FormAttribute) => {
    const Icon = attr.icon;

    return (
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium">{attr.name}</Label>
          {attr.visibility === 'Required' && <span className="text-red-500">*</span>}
        </div>

        {attr.type === "textarea" || attr.type === "text" && attr.name.toLowerCase().includes("notes") ? (
          <Textarea 
            placeholder={`Enter ${attr.name.toLowerCase()}`}
            className="w-full"
            disabled
          />
        ) : attr.type === "file" ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag your file(s) to start uploading</p>
            <p className="text-xs text-muted-foreground mt-1">OR</p>
            <Button variant="outline" size="sm" className="mt-2" disabled>
              Browse files
            </Button>
          </div>
        ) : attr.type === "Y/N" ? (
          <div className="flex items-center gap-2">
            <Switch disabled />
            <span className="text-sm text-muted-foreground">Yes/No</span>
          </div>
        ) : (
          <Input 
            type={attr.type === "date" ? "date" : attr.type === "number" ? "number" : attr.type === "email" ? "email" : attr.type === "phone" ? "tel" : attr.type === "url" ? "url" : "text"}
            placeholder={`Enter ${attr.name.toLowerCase()}`}
            className="w-full"
            disabled
          />
        )}
      </div>
    );
  };

  const availableAttributes = allAttributes; // Keep this for now, will be filtered by search

  return (
    <div className="h-full overflow-hidden bg-background flex flex-col">
      {/* Header with Back Button */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel} data-testid="button-back">
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Form Designer</h1>
            <p className="text-muted-foreground text-sm">
              Drag and drop attributes from the library to build your custom form
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Attribute Library */}
        <div className="w-72 border-r bg-card flex flex-col">
          <div className="p-4 border-b flex-1 overflow-hidden flex flex-col">
            <h3 className="font-semibold mb-4">Attribute Library</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-9"
                value={attributeSearch}
                onChange={(e) => setAttributeSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 overflow-auto flex-1">
              {availableAttributes
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter((attr) => 
                  attr.name.toLowerCase().includes(attributeSearch.toLowerCase()) ||
                  attr.type.toLowerCase().includes(attributeSearch.toLowerCase())
                )
                .map((attr) => (
                <AttributeItem key={attr.id} attribute={attr} />
              ))}
            </div>
          </div>

          <div className="p-4 border-t">
            <Button 
              className="w-full" 
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="button-new-attribute"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Attribute
            </Button>
          </div>
        </div>

        {/* Right Panel - Form Builder */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form Name <span className="text-red-500">*</span></Label>
                <Input
                  id="form-name"
                  placeholder="Enter form name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="text-base"
                  data-testid="input-form-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  placeholder="Enter form description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="text-base"
                  data-testid="input-form-description"
                />
              </div>

              {/* Drop Zone / Form Fields */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-card p-6 min-h-[400px] transition-colors ${
                  draggedOver
                    ? "border-primary bg-primary/5"
                    : formAttributes.length === 0
                    ? "border-border"
                    : "border-border"
                }`}
                data-testid="drop-zone"
              >
                {formAttributes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <h3 className="text-lg font-semibold mb-2">Drag and drop attributes here</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Start building your form by dragging attributes from the library.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formAttributes.map((attr, index) => (
                      <div
                        key={attr.formId}
                        draggable
                        onDragStart={(e) => handleReorderDragStart(e, index)}
                        onDragOver={(e) => handleReorderDragOver(e, index)}
                        onDragEnd={handleReorderDragEnd}
                        className={`border rounded-lg p-4 bg-card transition-all ${
                          draggedIndex === index ? "opacity-50" : ""
                        }`}
                        data-testid={`form-attribute-${attr.formId}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <div className="cursor-move mt-1">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>

                          {/* Field Preview */}
                          {renderFieldPreview(attr)}

                          {/* Field Options */}
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveAttribute(attr.formId)}
                                data-testid={`button-remove-${attr.formId}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Visibility</Label>
                              <Select
                                value={attr.visibility}
                                onValueChange={(value) => updateVisibility(attr.formId, value as 'Editable' | 'Required' | 'Read Only' | 'Hidden')}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Editable">Editable</SelectItem>
                                  <SelectItem value="Required">Required</SelectItem>
                                  <SelectItem value="Read Only">Read Only</SelectItem>
                                  <SelectItem value="Hidden">Hidden</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel} data-testid="button-cancel">
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveAs} data-testid="button-save-as">
                Save As
              </Button>
              <Button onClick={handleSaveForm} data-testid="button-save-form">
                Save Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Attribute Dialog */}
      <CreateAttributeDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}