import { useState, useRef, useCallback, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, FileText, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import type { Workflow, Form } from "@shared/schema";

interface WorkflowNode {
  id: string;
  type: "form" | "step";
  position: { x: number; y: number };
  data: {
    label: string;
    formId?: string;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export default function WorkflowDesigner() {
  const [, params] = useRoute("/workflows/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const workflowId = params?.id;
  const isNewWorkflow = workflowId === "new";

  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch workflow data if editing existing
  const { data: workflow } = useQuery<Workflow>({
    queryKey: ["/api/workflows", workflowId],
    enabled: !isNewWorkflow,
  });

  // Fetch available forms
  const { data: forms = [] } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  });

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setNodes(JSON.parse(workflow.nodes || "[]"));
      setEdges(JSON.parse(workflow.edges || "[]"));
    }
  }, [workflow]);

  const saveMutation = useMutation<Workflow>({
    mutationFn: async () => {
      const workflowData = {
        name: workflowName,
        description: "",
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
      };

      const response = isNewWorkflow
        ? await apiRequest("POST", "/api/workflows", workflowData)
        : await apiRequest("PUT", `/api/workflows/${workflowId}`, workflowData);

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow saved",
        description: "Your workflow has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      if (isNewWorkflow && data.id) {
        setLocation(`/workflows/${data.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save workflow.",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
  };

  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNode) return;

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === draggedNode
            ? {
                ...node,
                position: {
                  x: e.clientX - dragOffset.x,
                  y: e.clientY - dragOffset.y,
                },
              }
            : node
        )
      );
    },
    [draggedNode, dragOffset]
  );

  const handleDragEnd = () => {
    setDraggedNode(null);
  };

  const handleToolDrop = (
    e: React.DragEvent,
    type: "form" | "step",
    formId?: string,
    formName?: string
  ) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
      data: {
        label: formName || (type === "form" ? "Form" : "Step"),
        formId,
      },
    };

    setNodes((prev) => [...prev, newNode]);
  };

  const handleStartConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
  };

  const handleCompleteConnection = (targetNodeId: string) => {
    if (connectingFrom && connectingFrom !== targetNodeId) {
      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}`,
        source: connectingFrom,
        target: targetNodeId,
      };
      setEdges((prev) => [...prev, newEdge]);
    }
    setConnectingFrom(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
    setSelectedNode(null);
  };

  return (
    <Xwrapper>
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/workflows")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold border-0 focus-visible:ring-0 px-2 max-w-md"
            data-testid="input-workflow-name"
          />
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          data-testid="button-save-workflow"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Workflow"}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-64 border-r bg-card p-4 space-y-4 overflow-auto">
          <div>
            <h3 className="font-semibold mb-2">Workflow Builder</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Drag items to canvas, then click Connect to link them together
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <div className="font-medium text-sm mb-1">Forms</div>
              <p className="text-xs text-muted-foreground mb-2">
                Data collection points using your custom forms
              </p>
            </div>
            {forms.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2 border border-dashed rounded-md">
                No forms created yet. Create forms in the Forms tab.
              </div>
            ) : (
              forms.map((form) => (
                <div
                  key={form.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("type", "form");
                    e.dataTransfer.setData("formId", form.id);
                    e.dataTransfer.setData("formName", form.name);
                  }}
                  className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/30 hover-elevate cursor-move"
                  data-testid={`tool-form-${form.id}`}
                >
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm truncate">{form.name}</span>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <div>
              <div className="font-medium text-sm mb-1">Steps</div>
              <p className="text-xs text-muted-foreground mb-2">
                Generic workflow steps for approvals, decisions, or actions
              </p>
            </div>
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("type", "step");
              }}
              className="flex items-center gap-2 p-2 rounded-md bg-background border hover-elevate cursor-move"
              data-testid="tool-step"
            >
              <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">Generic Step</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-muted/30"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const type = e.dataTransfer.getData("type") as "form" | "step";
            const formId = e.dataTransfer.getData("formId");
            const formName = e.dataTransfer.getData("formName");
            handleToolDrop(e, type, formId, formName);
          }}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          data-testid="workflow-canvas"
        >
          {/* Edges using react-xarrows */}
          {edges.map((edge) => (
            <Xarrow
              key={edge.id}
              start={edge.source}
              end={edge.target}
              color="hsl(var(--primary))"
              strokeWidth={2}
              headSize={6}
              showHead={true}
              path="smooth"
              curveness={0.6}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => {
            const isForm = node.type === "form";
            const isConnecting = connectingFrom !== null;
            const isSource = connectingFrom === node.id;
            const canConnect = isConnecting && !isSource;
            
            return (
              <div
                key={node.id}
                id={node.id}
                className={`absolute border-2 rounded-lg shadow-md transition-all ${
                  isForm 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-card border-border"
                } ${
                  selectedNode === node.id ? "!border-primary ring-2 ring-primary/20" : ""
                } ${
                  isSource ? "ring-2 ring-primary scale-105" : ""
                } ${
                  canConnect ? "ring-2 ring-accent hover-elevate" : ""
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: "140px",
                  zIndex: draggedNode === node.id ? 10 : 2,
                  cursor: draggedNode === node.id ? "grabbing" : "grab",
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDragStart(node.id, e);
                  setSelectedNode(node.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node.id);
                }}
                data-testid={`node-${node.id}`}
              >
                <div className="p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    {isForm ? (
                      <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 text-primary" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <GitBranch className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium text-xs truncate">
                      {node.data.label}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground mb-2">
                    {isForm ? "Data Collection" : "Process Step"}
                  </div>

                  {/* Connection ports */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={isSource ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isConnecting) {
                          if (isSource) {
                            setConnectingFrom(null);
                          } else {
                            handleCompleteConnection(node.id);
                          }
                        } else {
                          handleStartConnection(node.id);
                        }
                      }}
                      className="text-xs h-6 flex-1 px-1"
                      data-testid={`button-connect-${node.id}`}
                    >
                      {isSource ? "Cancel" : canConnect ? "Set Target" : "Connect"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="text-xs h-6 px-1"
                      data-testid={`button-delete-${node.id}`}
                    >
                      Del
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No items on canvas</p>
                <p className="text-sm mt-1">
                  Drag forms or steps from the sidebar to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </Xwrapper>
  );
}
