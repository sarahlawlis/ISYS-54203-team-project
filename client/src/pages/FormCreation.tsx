import { useState } from "react";
import type { DragEvent } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus
} from "lucide-react";

interface Attribute {
  id: string;
  name: string;
  type: string;
  icon: any;
}

interface FormAttribute extends Attribute {
  formId: string;
}

const availableAttributes: Attribute[] = [
  { id: "1", name: "Customer Name", type: "text", icon: FileText },
  { id: "2", name: "Due Date", type: "date", icon: Calendar },
  { id: "3", name: "Retailer", type: "text", icon: FileText },
  { id: "4", name: "General Notes", type: "text", icon: AlignLeft },
  { id: "5", name: "Structural Design Needed", type: "Y/N", icon: CheckSquare },
  { id: "6", name: "Quotes", type: "file", icon: Upload },
  { id: "7", name: "Purchase Orders", type: "file", icon: Upload },
  { id: "8", name: "Structure Files", type: "file", icon: Upload },
];

const nativeTools: Attribute[] = [
  { id: "n1", name: "Email", type: "email", icon: Mail },
  { id: "n2", name: "Phone Number", type: "phone", icon: Phone },
  { id: "n3", name: "Number", type: "number", icon: Hash },
  { id: "n4", name: "URL", type: "url", icon: LinkIcon },
  { id: "n5", name: "Long Text", type: "textarea", icon: AlignLeft },
];

export default function FormCreation() {
  const [, setLocation] = useLocation();
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAttributes, setFormAttributes] = useState<FormAttribute[]>([]);
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragStart = (e: DragEvent, attribute: Attribute) => {
    e.dataTransfer.setData("attribute", JSON.stringify(attribute));
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
    
    const attributeData = e.dataTransfer.getData("attribute");
    if (attributeData) {
      const attribute: Attribute = JSON.parse(attributeData);
      const newFormAttribute: FormAttribute = {
        ...attribute,
        formId: `form-${Date.now()}`,
      };
      setFormAttributes([...formAttributes, newFormAttribute]);
    }
  };

  const handleRemoveAttribute = (formId: string) => {
    setFormAttributes(formAttributes.filter(attr => attr.formId !== formId));
  };

  const handleSaveForm = () => {
    console.log("Saving form:", { formName, formDescription, formAttributes });
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
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-hidden bg-background flex">
      {/* Left Panel - Attribute Library */}
      <div className="w-72 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Tabs defaultValue="attributes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attributes" data-testid="tab-attributes">
                Attributes
              </TabsTrigger>
              <TabsTrigger value="native" data-testid="tab-native-tools">
                Native Tools
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attributes" className="mt-4 space-y-2 max-h-[calc(100vh-280px)] overflow-auto">
              {availableAttributes.map((attr) => (
                <AttributeItem key={attr.id} attribute={attr} />
              ))}
            </TabsContent>
            
            <TabsContent value="native" className="mt-4 space-y-2 max-h-[calc(100vh-280px)] overflow-auto">
              {nativeTools.map((tool) => (
                <AttributeItem key={tool.id} attribute={tool} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <Button className="w-full" data-testid="button-new-attribute">
            <Plus className="h-4 w-4 mr-2" />
            New Attribute
          </Button>
        </div>
      </div>

      {/* Right Panel - Form Builder */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Form Designer</h1>
            <p className="text-muted-foreground mt-1">
              Drag and drop attributes from the library to build your custom form.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Form Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-base"
                data-testid="input-form-name"
              />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Form Description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-base"
                data-testid="input-form-description"
              />
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-card p-8 min-h-[400px] transition-colors ${
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
                <div className="space-y-3">
                  {formAttributes.map((attr) => (
                    <Card key={attr.formId} className="relative" data-testid={`form-attribute-${attr.formId}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-accent flex-shrink-0">
                            <attr.icon className="h-4 w-4 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{attr.name}</p>
                            <p className="text-xs text-muted-foreground">{attr.type}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttribute(attr.formId)}
                          data-testid={`button-remove-${attr.formId}`}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
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
  );
}
