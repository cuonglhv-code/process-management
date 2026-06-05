import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export const ActionNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative px-5 py-3 rounded-lg bg-brand-teal text-white shadow-sm min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!bg-brand-teal" />
      <div className="text-sm font-medium text-center">{data.label as string}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand-teal" />
    </div>
  );
});

ActionNode.displayName = "ActionNode";
