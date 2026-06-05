import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export const TerminalNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative px-6 py-2 rounded-full bg-brand-coral text-white shadow-sm min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!bg-brand-coral" />
      <div className="text-sm font-medium text-center">{data.label as string}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand-coral" />
    </div>
  );
});

TerminalNode.displayName = "TerminalNode";
