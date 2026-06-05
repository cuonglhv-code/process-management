import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export const DecisionNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-brand-purple" />
      <div className="px-5 py-4 bg-brand-purple text-white shadow-sm min-w-[140px]"
        style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
      >
        <div className="text-sm font-medium text-center">{data.label as string}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand-purple" />
    </div>
  );
});

DecisionNode.displayName = "DecisionNode";
