import { memo } from "react";
import { type NodeProps } from "reactflow";

export const AnnotationNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 border-2 border-dashed border-amber-400 bg-amber-50 text-amber-800 italic text-sm rounded min-w-[160px]">
      {data.label as string}
    </div>
  );
});

AnnotationNode.displayName = "AnnotationNode";
