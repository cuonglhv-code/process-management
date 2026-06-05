import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "reactflow";

export const CustomEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style,
    markerEnd,
  }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const isDashed = (data?.style as string) === "dashed";

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            ...style,
            strokeDasharray: isDashed ? "5 5" : undefined,
            strokeWidth: 2,
          }}
          markerEnd={markerEnd}
        />
        {data?.label && (
          <EdgeLabelRenderer>
            <div
              className="absolute bg-white px-2 py-0.5 text-xs text-muted-foreground rounded shadow-sm border"
              style={{
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                pointerEvents: "all",
              }}
            >
              {data.label as string}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

CustomEdge.displayName = "CustomEdge";
