"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { ChevronLeft, Save, LayoutGrid, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ActionNode } from "@/components/flow/nodes/ActionNode";
import { DecisionNode } from "@/components/flow/nodes/DecisionNode";
import { TerminalNode } from "@/components/flow/nodes/TerminalNode";
import { AnnotationNode } from "@/components/flow/nodes/AnnotationNode";
import { CustomEdge } from "@/components/flow/edges/CustomEdge";
import dagre from "@dagrejs/dagre";

const nodeTypes: NodeTypes = {
  action: ActionNode,
  decision: DecisionNode,
  terminal: TerminalNode,
  annotation: AnnotationNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface StepData {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  responsibleRole: string | null;
  helpText: string | null;
  richNotes: string | null;
  order: number;
  linkedForms: Array<any>;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string | null;
  style: string;
}

interface ProcessData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  published: boolean;
  steps: StepData[];
}

const nodeTypeOptions = [
  { value: "action", label: "Action", color: "bg-brand-teal" },
  { value: "decision", label: "Decision", color: "bg-brand-purple" },
  { value: "terminal", label: "Terminal", color: "bg-brand-coral" },
  { value: "annotation", label: "Annotation", color: "bg-amber-400" },
];

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, { width: 180, height: 60 })
  );

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - 90, y: pos.y - 30 },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function ProcessEditClient({ process }: { process: ProcessData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("diagram");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const initialNodes: Node[] = useMemo(
    () =>
      process.steps.map((s) => ({
        id: s.id,
        type: s.type,
        position: s.position,
        data: { label: s.label, stepId: s.id },
      })),
    []
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      process.steps.flatMap((s) =>
        (s as any).outgoingEdges?.map((e: any) => ({
          id: e.id,
          source: e.sourceId,
          target: e.targetId,
          type: "custom",
          data: { label: e.label, style: e.style },
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: e.style === "dashed",
        })) ?? []
      ),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [tempIdCounter, setTempIdCounter] = useState(
    process.steps.length + 1
  );

  const [title, setTitle] = useState(process.title);
  const [description, setDescription] = useState(process.description ?? "");
  const [category, setCategory] = useState(process.category ?? "");
  const [tags, setTags] = useState(process.tags.join(", "));
  const [published, setPublished] = useState(process.published);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      const newEdge: Edge = {
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: "custom",
        data: { label: null, style: "solid" },
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(
    (type: string) => {
      const id = `temp_${tempIdCounter}`;
      setTempIdCounter((c) => c + 1);
      const newNode: Node = {
        id,
        type,
        position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 },
        data: { label: `New ${type}` },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [tempIdCounter, setNodes]
  );

  const updateSelectedNode = useCallback(
    (field: string, value: string) => {
      if (!selectedNode) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, [field]: value } }
            : n
        )
      );
      setSelectedNode((prev) =>
        prev
          ? { ...prev, data: { ...prev.data, [field]: value } }
          : null
      );
    },
    [selectedNode, setNodes]
  );

  const autoLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  }, [nodes, edges, setNodes, setEdges]);

  async function saveDiagram() {
    try {
      const stepsPayload = nodes.map((n, i) => ({
        tempId: n.id,
        type: n.type ?? "action",
        label: (n.data.label as string) ?? "Untitled",
        position: n.position,
        order: i,
      }));

      const edgesPayload = edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: (e.data as any)?.label ?? null,
        style: (e.data as any)?.style ?? "solid",
      }));

      const res = await fetch(
        `/api/processes/${process.id}/save-diagram`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            steps: stepsPayload,
            edges: edgesPayload,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Diagram saved");
      router.refresh();
    } catch {
      toast.error("Failed to save diagram");
    }
  }

  async function saveMetadata() {
    try {
      const res = await fetch(`/api/processes/${process.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          category: category || null,
          tags: tags
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          published,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Metadata saved");
      router.refresh();
    } catch {
      toast.error("Failed to save metadata");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/processes/${process.id}`)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-sm font-medium">{process.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "diagram" && (
            <>
              <Button variant="outline" size="sm" onClick={autoLayout}>
                <LayoutGrid className="h-4 w-4 mr-1" />
                Auto-layout
              </Button>
              <Button size="sm" onClick={saveDiagram}>
                <Save className="h-4 w-4 mr-1" />
                Save diagram
              </Button>
            </>
          )}
          {activeTab === "metadata" && (
            <Button size="sm" onClick={saveMetadata}>
              <Save className="h-4 w-4 mr-1" />
              Save metadata
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 border-b bg-white">
          <TabsList>
            <TabsTrigger value="diagram">Diagram</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="diagram" className="flex-1 flex m-0">
          {/* Node palette sidebar */}
          <div className="w-48 border-r bg-white p-3 space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase">
              Add node
            </h3>
            {nodeTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => addNode(opt.value)}
                className="w-full text-left px-3 py-2 text-sm rounded border hover:bg-accent transition-colors flex items-center gap-2"
              >
                <span
                  className={`w-3 h-3 rounded-full ${opt.color}`}
                />
                {opt.label}
              </button>
            ))}

            <Separator />

            {/* Selected node editor */}
            {selectedNode && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase">
                  Edit node
                </h3>
                <div className="space-y-2">
                  <Label className="text-xs">Label</Label>
                  <Input
                    className="h-8 text-sm"
                    value={(selectedNode.data.label as string) ?? ""}
                    onChange={(e) =>
                      updateSelectedNode("label", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* React Flow canvas */}
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable
              nodesConnectable
              fitView
              minZoom={0.3}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <MiniMap
                nodeStrokeWidth={3}
                maskColor="rgba(0,0,0,0.1)"
                style={{ borderRadius: 8 }}
              />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
              />
            </ReactFlow>
          </div>
        </TabsContent>

        <TabsContent
          value="metadata"
          className="flex-1 overflow-y-auto p-6 m-0"
        >
          <div className="max-w-lg space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat">Category</Label>
              <Input
                id="edit-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Sales, Academic, Finance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">
                Tags (comma-separated)
              </Label>
              <Input
                id="edit-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="edit-published">Published</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
