"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProcessDiagram } from "@/components/flow/ProcessDiagram";
import { StepDetailDrawer } from "@/components/drawer/StepDetailDrawer";

interface FormData {
  id: string;
  label: string;
  url: string;
  type: string;
}

interface StepData {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  responsibleRole: string | null;
  helpText: string | null;
  richNotes: string | null;
  order: number;
  linkedForms: FormData[];
  outgoingEdges?: EdgeData[];
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
  owner: { name: string | null; email: string };
  steps: StepData[];
  published: boolean;
  updatedAt: string;
}

interface ProcessViewClientProps {
  process: ProcessData;
  canEdit: boolean;
}

export function ProcessViewClient({
  process,
  canEdit,
}: ProcessViewClientProps) {
  const router = useRouter();
  const [selectedStep, setSelectedStep] = useState<StepData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleStepClick = useCallback((step: any) => {
    setSelectedStep(step);
    setDrawerOpen(true);
  }, []);

  const edges: EdgeData[] = process.steps.flatMap((step) =>
    step.outgoingEdges?.map((e: any) => ({
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      label: e.label,
      style: e.style,
    })) ?? []
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6">
      {/* Left panel: Flow diagram */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="h-full">
          <ProcessDiagram
            steps={process.steps}
            edges={edges}
            onStepClick={handleStepClick}
            readonly
          />
        </div>
      </div>

      {/* Right panel: Process metadata */}
      <div className="w-[300px] border-l border-border bg-white overflow-y-auto p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{process.title}</h1>
            <Badge
              variant={process.published ? "default" : "outline"}
              className={
                process.published
                  ? "bg-brand-teal text-white"
                  : "text-muted-foreground"
              }
            >
              {process.published ? "Published" : "Draft"}
            </Badge>
          </div>
          {process.category && (
            <Badge
              variant="secondary"
              className="bg-brand-teal/10 text-brand-teal border-0"
            >
              {process.category}
            </Badge>
          )}
        </div>

        {process.description && (
          <p className="text-sm text-muted-foreground">
            {process.description}
          </p>
        )}

        {process.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {process.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Owner: </span>
            <span className="font-medium">
              {process.owner.name ?? process.owner.email}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Steps: </span>
            <span className="font-medium">{process.steps.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last updated: </span>
            <span className="font-medium">
              {new Date(process.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Step index
          </h3>
          <div className="space-y-1">
            {process.steps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(step)}
                className="w-full text-left text-sm py-1.5 px-2 rounded hover:bg-accent transition-colors"
              >
                <span className="text-muted-foreground mr-2">
                  {step.order}.
                </span>
                {step.label}
                {step.responsibleRole && (
                  <span className="text-xs text-muted-foreground ml-2">
                    — {step.responsibleRole}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {canEdit && (
          <Button
            className="w-full"
            onClick={() => router.push(`/processes/${process.id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit process
          </Button>
        )}
      </div>

      <StepDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        step={selectedStep}
      />
    </div>
  );
}
