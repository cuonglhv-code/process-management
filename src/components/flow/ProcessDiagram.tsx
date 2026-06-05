"use client";

import { useMemo, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { ActionNode } from "./nodes/ActionNode";
import { DecisionNode } from "./nodes/DecisionNode";
import { TerminalNode } from "./nodes/TerminalNode";
import { AnnotationNode } from "./nodes/AnnotationNode";
import { CustomEdge } from "./edges/CustomEdge";

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
  linkedForms: Array<{
    id: string;
    label: string;
    url: string;
    type: string;
  }>;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string | null;
  style: string;
}

interface ProcessDiagramProps {
  steps: StepData[];
  edges: EdgeData[];
  onStepClick?: (step: StepData) => void;
  readonly?: boolean;
}

export function ProcessDiagram({
  steps,
  edges: edgeData,
  onStepClick,
  readonly = true,
}: ProcessDiagramProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      steps.map((s) => ({
        id: s.id,
        type: s.type === "terminal" ? "terminal" :
              s.type === "decision" ? "decision" :
              s.type === "annotation" ? "annotation" : "action",
        position: s.position,
        data: {
          label: s.label,
          stepId: s.id,
        },
      })),
    [steps]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      edgeData.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "custom",
        data: {
          label: e.label,
          style: e.style,
        },
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: e.style === "dashed",
      })),
    [edgeData]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (readonly && onStepClick) {
        const step = steps.find((s) => s.id === node.id);
        if (step) onStepClick(step);
      }
    },
    [readonly, onStepClick, steps]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
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
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
